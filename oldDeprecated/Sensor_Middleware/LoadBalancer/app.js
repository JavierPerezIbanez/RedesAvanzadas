const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer();

// List of server instances to balance requests
const servers = [
    { host: 'localhost', port: 4001 },
    { host: 'localhost', port: 4002 },
    // Add more servers as needed
];

let currentIndex = 0;

// Round-robin load balancing
function getNextServer() {
    const server = servers[currentIndex];
    currentIndex = (currentIndex + 1) % servers.length;
    return server;
}

app.all('*', (req, res) => {
    const { host, port } = getNextServer();
    const target = `http://${host}:${port}`;
    proxy.web(req, res, { target });
});

/*
// Configuración del balanceador de carga
app.use('/',function(req, res, next) {
    // Redirige la solicitud al servidor actual y actualiza el índice para la siguiente solicitud
    req.url = servers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % servers.length;
    next();
})

app.use((req, res, next) => {
    // Captura la respuesta del servidor destino
    let responseFromServer = '';

    // Intercepta la función end para capturar la respuesta
    const end = res.end;
    res.end = function (data) {
        responseFromServer += data.toString();
        end.apply(this, arguments);
    };

    // Cuando la respuesta se haya enviado completamente, loguea la respuesta del servidor destino
    res.on('finish', () => {
        console.log('Respuesta del servidor:', responseFromServer);
    });

    next();
});*/
/*
app.get('/',function (req,res,next){
    res.send('¡Hola desde Express!');
    next()
})

app.post('/',function (req,res,next){
    next()

})*/

const PORT = 4000;
app.listen(PORT, () => {
    console.log('LOAD-BALANCER');
    console.log(`LoadBalancer escuchando en el puerto ${PORT}`);
});

module.exports = app;