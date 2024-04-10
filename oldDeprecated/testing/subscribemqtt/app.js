const mqtt = require('mqtt');

// MQTT Broker Connection
const mqttClient = mqtt.connect('mqtt://localhost:1883');

var topic= [
    'all',
    'temperatura',
    'co2',
    'humedad',
    'volatiles',
]

// Suscribirse a los topics 'httpRequests' y 'otroTopic'
mqttClient.on('connect', () => {
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error('Error subscribing to topics:', err);
        } else {
            console.log('Subscribed to topics '+topic.toString());
        }
    });
});

// Manejar los mensajes recibidos

mqttClient.on('message', function (topic, message){
    console.log('Received message from topic:', topic.toString());
    console.log('Message:', message.toString()); // Mensaje recibido en formato de cadena
    // Puedes agregar aquí la lógica para procesar los mensajes recibidos
});