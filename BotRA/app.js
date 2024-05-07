const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');


const botToken = '6626788083:AAH37DXg5Zm9dGeodvvVXaha403Axm3xk30'; // Replace with your own bot token
const bot = new TelegramBot(botToken, { polling: true });
const userId =1660238721;

const url ="http://10.100.0.102:5001/bot/average"



fetch(url, {
  method: "GET" // default, so we can ignore
})






const intervalo = 5000;  // 5 mins
setInterval(async () => {
        // Enviar datos a todos los usuarios
    obtenerDatosDelSensor;
}, intervalo);


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;


  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
  }
  if (messageText === '/average') {
    obtenerDatosDelSensor();
  }
});


async function obtenerDatosDelSensor() {
  try {
      const response = await axios.get('http://10.100.0.102:5001/botaverage');
      console.log('Datos del sensor:', response.data);
      //const msn = JSON.stringify(response.data);
      bot.sendMessage(userId, 'Datos del sensor:'+ response.data.temperatura);
  } catch (error) {
      console.error('Error al obtener los datos del sensor:', error);
  }
}

