const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');


const botToken = '6626788083:AAH37DXg5Zm9dGeodvvVXaha403Axm3xk30'; // Replace with your own bot token
const bot = new TelegramBot(botToken, { polling: true });
const userId =1660238721;
const Influx = require('influx');
const url ="http://10.100.0.102:5001/bot/average"
const influxToken = "AiIetQMWOVlZ9h6o21LOnpMjYP5KJ016cBx5twWvco9VLN4xdQ5XaF2MQgMvHsorcbAkPIyXP60VtxfBrlUKEQ==";
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

const influx = new InfluxDB({
  host: '10.100.0.102',
  database: bucket,
  token: influxToken
  // Otros detalles de configuración según sea necesario
});

fetch(url, {
  method: "GET" // default, so we can ignore
})


// Función para obtener datos del servicio SOAP

async function fetchData() {
    try {
        const client = await soap.createClientAsync('URL_DEL_SERVICIO_SOAP');
        
        // Ejemplo de llamada al método SOAP
        const result = await client.NombreDelMetodoAsync({
            parametro1: 'valor1',
            parametro2: 'valor2',
            // ... otros parámetros
        });
        
        return result;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        return null;
    }
}

const intervalo = 30000;  // 5 mins
setInterval(async () => {
        // Enviar datos a todos los usuarios
    obtenerDatosDelSensor;
}, intervalo);

function consultaInfluxYEnviarATelegram(chatId) {
    influx.query('from(bucket: "DataBucket")|> filter(fn: (r) => r["_measurement"] == "sensor_data") |> filter(fn: (r) => r["_field"] == "co2") |> filter(fn: (r) => r["id_sensor"] == "101.2" or r["id_sensor"] == "11.1" or r["id_sensor"] == "1103.2" or r["id_sensor"] == "112.1" or r["id_sensor"] == "114.1" or r["id_sensor"] == "2103.1") |> aggregateWindow(every: v.windowPeriod, fn: median, createEmpty: false) |> median(column: "_value")').then(result => {
        // Procesar el resultado de la consulta si es necesario
        const respuesta = JSON.stringify(result);
        bot.sendMessage(chatId, respuesta);
      })
      .catch(error => {
        console.error('Error al consultar InfluxDB:', error);
        bot.sendMessage(chatId, 'Ocurrió un error al consultar InfluxDB');
      });
  }
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;


  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  }
  if(messageText=== '/prediccion'){ 
    const result = await fetchData();
    if (result) {
        bot.sendMessage(chatId,  '${JSON.stringify(result)}');
    } else {
        bot.sendMessage(chatId, 'Error al obtener los datos.');
    }
  }
});


async function obtenerDatosDelSensor() {
  try {
      const response = await axios.get('http://10.100.0.102:5001/bot/average');
      console.log('Datos del sensor:', response.data);
      bot.sendMessage(chatId, 'Datos del sensor:'+ response);
  } catch (error) {
      console.error('Error al obtener los datos del sensor:', error);
  }
}

