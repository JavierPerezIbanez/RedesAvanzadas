const express = require('express');
const httpProxy = require('http-proxy');
const ipfilter=require('ipfilter')
const app = express();
const proxy = httpProxy.createProxyServer();

const haProxyPort = 4000;

const RATE_LIMIT = 600;
/**
 * Valor en ms
 * @type {number}
 */
const REFILL_RATE=500;

const tokenBucket = [];

var ips = ['127.0.0.1','::ffff:127.0.0.1','10.0.2.10','10.0.2.11','10.0.2.12','10.0.2.13'];

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

//Job to periodically refill the bucket
setInterval(refillBucket,REFILL_RATE);

app.all('*',(req, res) => {
    const target = `http://localhost:${haProxyPort}`;
    console.log(req.ip);
    proxy.web(req, res, { target });
});


const PORT = 3999;

app.listen(PORT, () => {
    console.log('TokenBucket');
    console.log(`TokenBucket escuchando en el puerto ${PORT}`);
});

module.exports = app;