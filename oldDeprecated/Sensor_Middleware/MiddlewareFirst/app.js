const express = require('express');
const mqtt = require('mqtt')

const app = express();

//Conection to MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883');

//Time Logger
app.use(function (req, res, next) {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const date=("["+now.toLocaleString('es-ES', options).replace(',', '')+"]");
    process.stdout.write(date)
    next()
})

app.get('/', (req, res) => {
    res.send('¡Hola desde el servidor 1!');

    const mqttMessage = JSON.stringify({
        server: 'server1',
        method: req.method,
        url: req.url
    });
    mqttClient.publish('httpRequests', mqttMessage);
});

const PORT = 4001;
app.listen(PORT, () => {
    console.log(`Servidor 1 escuchando en el puerto ${PORT}`);
});