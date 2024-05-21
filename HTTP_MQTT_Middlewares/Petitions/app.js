const http = require("http");
const querystring = require("querystring");

const sensors = ["nodo_1","nodo_2","nodo_3"];// ["11.1", "101.2", "112.1", "2103.1", "1103.2", "114.1"];

// Generate a random number between a range
function getRandom(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Generate select a random position of an array
function getRandomArrayPosition(lenght) {
  return Math.floor(Math.random() * lenght);
}

function sendReq() {
  const queryParams = {
    id_sensor: sensors[getRandomArrayPosition(sensors.length)],
    temperatura: getRandom(20, 30),
    volatiles: getRandom(0, 100),
    humedad: getRandom(40, 60),
    co2: getRandom(350, 5000),
  };
  const options = {
    hostname: "127.0.0.1",
    port: 80,
    path: "/save",
    method: "GET",
  };

  options.path += "?" + querystring.stringify(queryParams);

  const req = http.request(options, (res) => {
    console.log(`Estado de la respuesta: ${res.statusCode}`);
    // Manejar la respuesta aquí si es necesario
  });

  req.on("error", (error) => {
    console.error(`Error al enviar la solicitud: ${error}`);
  });

  req.end();
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var numReq = 1000;
var tEspera = 2;
// Función asincrónica para enviar las solicitudes de manera secuencial
async function enviarSolicitudes() {
  for (let i = 0; i < numReq; i++) {
    console.log('Esperando '+tEspera+' milisegundos...');
    await wait(tEspera);
    sendReq();
  }
}

// Llamar a la función para enviar las solicitudes
enviarSolicitudes().catch(err => console.error(err));
