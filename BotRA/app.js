const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');


const botToken = '6626788083:AAH37DXg5Zm9dGeodvvVXaha403Axm3xk30'; // Replace with your own bot token
const bot = new TelegramBot(botToken, { polling: true });
const urlAverage ="http://10.100.0.102:5001/botaverage";
const urlLast ="http://10.100.0.102:5001/lastvalue";




/*
const intervalo = 5000;  // 5 mins
setInterval(async () => {
        // Enviar datos a todos los usuarios
    obtenerDatosDelSensor;
}, intervalo);
*/

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;


  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');
    mostrarMenu(chatId);
  }
  else if (messageText === '/average') {
    obtenerDatosDelSensor(chatId);
  }else if(messageText === '/help'){
    mostrarMenu(chatId);
  }else if (messageText.startsWith('/average_')){
    const aux = messageText.split('_');
    const segs= aux[1];
    obtenerDatosDelSensorUltimosSeg(chatId,segs);
  }else if (messageText.startsWith('/actual_')){
    const aux = messageText.split('_');
    const variable= aux[1];
    obtenerUltimoDatoVariable(chatId,variable);
  }


});


async function obtenerDatosDelSensor(chatId) {
  try {
      const response = await axios.get(urlAverage);
      console.log('Datos del sensor: ', response.data);
      const msn = JSON.stringify(response.data);
      bot.sendMessage(chatId, msn);
  } catch (error) {
      console.error('Error al obtener los datos del sensor:', error);
  }
}

async function obtenerDatosDelSensorUltimosSeg(chatId, segs){

  try {
    const response =await axios.get(urlAverage+"?timeinseconds="+segs);
    console.log('Datos del sensor:', response.data);
    const msn = JSON.stringify(response.data);
    bot.sendMessage(chatId, "Datos de los ultimos "+segs+" segundos" + msn);
} catch (error) {
    console.error('Error al obtener los datos del sensor:', error);
}
}
async function obtenerUltimoDatoVariable(chatId, variable){
  try {
    const msn="";
    const response = await axios.get(urlLast);
    if (variable === "co2"){
      msn = JSON.stringify(response.data.co2);
    }
    /*console.log('Datos del sensor:', response.data.variable);
    msn = JSON.stringify(response.data.variable);*/
    bot.sendMessage(chatId, msn);
} catch (error) {
    console.error('Error al obtener los datos del sensor:', error);
}
}
async function mostrarMenu(chatId){
  bot.sendMessage(chatId,"/help --> Mostrar comandos\n"+
                  "/average --> Mostrar media de datos de los ultimos 5 minutos\n"+
                  "/average_X --> X siendo el tiempo en segundos que quieres saber la media de todos los datos.\n"+
                  "/actual_X -->X siendo una de las variables que son pedidas. Pueden ser: volatiles, co2, temperatura, humedad o all para todo.\n"
   );
}

