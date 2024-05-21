const express = require('express');
const httpProxy = require('http-proxy');
const { CronJob } = require('cron');
const ipfilter=require('ipfilter')
const app = express();
const proxy = httpProxy.createProxyServer();

const haProxyPort = 4000;

const RATE_LIMIT = 10;

const tokenBucket = [];

var ips = ['::ffff:127.0.0.1','::ffff:10.0.2.10','::ffff:10.0.2.11','10.0.2.12','::ffff:10.0.2.13'];

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

app.use(ipfilter(ips, { mode: 'allow' }));
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

app.all('*',ipfilter(ips, {mode: 'allow'}) ,(req, res) => {
    const target = `http://localhost:${haProxyPort}`;
    console.log(req.ip);
    proxy.web(req, res, { target });
});


const PORT = 3999;

app.listen(PORT, () => {
    console.log('TokenBucket');
    console.log(`TokenBucket escuchando en el puerto ${PORT}`);
    job.start();
});

module.exports = app;