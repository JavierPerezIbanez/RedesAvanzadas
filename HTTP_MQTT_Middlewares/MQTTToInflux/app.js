const mqtt = require('mqtt');
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

// MQTT Broker Connection
const mqttClient = mqtt.connect('mqtt://localhost:1883');

// Data for influxDB insertion
const url = "http://localhost:8087";
const token = "LQZlj_wX7MkOThNpHBeozbyT_vOim0aqX2YpqUSoQpimHmqJBK9hoBeo4M08UTQWMU9MtJSRdLEkoj7XNdJIbw==";
const org = "RA_2";
const bucket = "DataBucket";

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket,'ns')

var topics = [
    'all',
    'temperatura',
    'co2',
    'humedad',
    'volatiles',
];

// Suscribirse a los topics 'httpRequests' y 'otroTopic'
mqttClient.on('connect', () => {
    mqttClient.subscribe(topics, (err) => {
        if (err) {
            console.error('Error subscribing to topics:', err);
        } else {
            console.log('Subscribed to topics', topics);
        }
    });
});

// Manejar los mensajes recibidos
mqttClient.on('message', (topic, message) => {
    console.log('Received message from topic:', topic);
    // Convertir el mensaje de cadena JSON a un objeto JavaScript
    const parsedMessage = JSON.parse(message.toString());
    console.log('Parsed message:', parsedMessage); // Objeto JavaScript
    //Insertamos la logica de inserción en la DB
    // Crear un punto de datos con la medición 'sensor_data' y los campos correspondientes
    const point = new Point('sensor_data')
        .tag('id_sensor', parsedMessage.id_sensor)
        .floatField('temperatura', parsedMessage.temperatura)
        .floatField('humedad', parsedMessage.humedad)
        .floatField('co2', parsedMessage.co2)
        .floatField('volatiles', parsedMessage.volatiles)
        .timestamp(new Date());

    // Escribir el punto de datos en InfluxDB utilizando el writeApi
    writeApi.writePoint(point);
});
