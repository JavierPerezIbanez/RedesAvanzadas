const mqtt = require('mqtt');
const {InfluxDB, Point} = require("@influxdata/influxdb-client");

/**
 * MQTT Broker Connection
 * @type {MqttClient}
 */
const mqttClient = mqtt.connect('mqtt://localhost:1883');
//Data used to connect to Influx
/**
 * Route where the influxDB is hosted
 * @type {string}
 */
const url = "http://localhost:8086";
//homeToken
const token = "UHt34RryJY09lbsWFXCdra_9ujVbBpterQE3LUleseDsllj4_lAaXLzT5c3f5eFpiOr5rxRi39WRcUIu1ODTBA==";
/**
 * An access token with the highest level of privileges
 * @type {string}
 */
//Consider changing this with a restricted token for security
//const token = "AiIetQMWOVlZ9h6o21LOnpMjYP5KJ016cBx5twWvco9VLN4xdQ5XaF2MQgMvHsorcbAkPIyXP60VtxfBrlUKEQ==";
/**
 * Organization that owns the bucket in which we will insert the data
 * @type {string}
 */
const org = "RA_2";
/**
 * Bucket in which we will insert the data
 * @type {string}
 */
const bucket = "DataBucket";
/**
 * The connection to influx
 * @type {InfluxDB}
 */
const influxDB = new InfluxDB({url, token});
/**
 * API that only allows writing in the bucket own by the organization
 * @type {WriteApi}
 */
const writeApi = influxDB.getWriteApi(org, bucket)

/**
 * String Array with all the topics to subscribe in the MQTT connection.
 * @type {string[]}
 */
var topics = [
    'all',
    'temperatura',
    'co2',
    'humedad',
    'volatiles',
];

// This call subscribe to the defined topics when the MQTT broker is up, it also shows the error in the console
mqttClient.on('connect', () => {
    mqttClient.subscribe(topics, (err) => {
        if (err) {
            console.error('Error subscribing to topics:', err);
        } else {
            console.log('Subscribed to topics', topics);
        }
    });
});


// This function handles all the messages received in the MQTT and try to insert the data in the message to the bucket

mqttClient.on('message', (topic, message) => {
    console.log('Received message from topic:', topic);
    // Convertir el mensaje de cadena JSON a un objeto JavaScript
    const parsedMessage = JSON.parse(message.toString());
    console.log('Parsed message:', parsedMessage); // Objeto JavaScript
    //InfluxDB insertion handler
    try {
        //Creates the new point under the specified measurement name with the following tag and fields
        var point = new Point('sensor_data')
            .tag('id_sensor', parsedMessage.id_sensor)
            .floatField('temperatura', parsedMessage.temperatura)
            .floatField('humedad', parsedMessage.humedad)
            .floatField('co2', parsedMessage.co2)
            .floatField('volatiles', parsedMessage.volatiles);

        //Write the point in InfluxDB bucket
        writeApi.writePoint(point);
        console.log('Data inserted successfully.');
    } catch (error) {
        console.error('Error inserting data into InfluxDB:', error);
    }
});
