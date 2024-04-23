const TelegramBot = require('node-telegram-bot-api');
const soap = require('soap');


const token = '6626788083:AAH37DXg5Zm9dGeodvvVXaha403Axm3xk30'; // Replace with your own bot token
const bot = new TelegramBot(token, { polling: true });
const userId =1660238721;

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

const intervalo = 500000;  // 5 mins
setInterval(async () => {
    const result = "hola";
    
   
        // Enviar datos a todos los usuarios
    const users = [/* Lista de IDs de usuarios a los que quieres enviar datos */];
    bot.sendMessage(userId, "Datos automáticos: "+ result);
}, intervalo);


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
