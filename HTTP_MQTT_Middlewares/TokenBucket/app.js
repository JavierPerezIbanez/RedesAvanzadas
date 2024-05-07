const express = require('express');
const httpProxy = require('http-proxy');
const CronJob = require('cron');

const app = express();
const proxy = httpProxy.createProxyServer();

// List of server instances to balance requests
const haProxyPort = 4000;

const RATE_LIMIT = 10;

const tokenBucket = [];

// Function to refill the bucket
const refillBucket = () => {
    if (tokenBucket.length < RATE_LIMIT) {
        tokenBucket.push(Date.now());
    }
};

// API endpoint to check the bucket's status
app.get('/bucket', (req, res) => {

    res.json({
        bucketLimit: RATE_LIMIT,
        currentBucketSize: tokenBucket.length,
        bucket: tokenBucket
    });
});

// Middleware for rate limiting
const rateLimitMiddleware = (req, res, next) => {

    if (tokenBucket.length > 0) {
        const token = tokenBucket.shift();
        console.log(`Token ${token} is consumed`);

        res.set('X-RateLimit-Remaining', tokenBucket.length);
        next();
    }
    else
    {
        res.status(429).set('X-RateLimit-Remaining', 0).set('Retry-After', 2).json({
            success: false,
            message: 'Too many requests'
        });
    }
};

app.use(rateLimitMiddleware);

// Cron job to periodically refill the bucket
const job = new CronJob('*/2 * * * * *', () => {
    refillBucket();
});
app.all('*', (req, res) => {
    const target = `http://localhost:${haProxyPort}`;
    proxy.web(req, res, { target });
});


const PORT = 80;
app.listen(PORT, () => {
    console.log('TokenBucket');
    console.log(`TokenBucket escuchando en el puerto ${PORT}`);
});

module.exports = app;