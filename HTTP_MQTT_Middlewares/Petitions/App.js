const http = require('http');
const querystring = require('querystring');
const numReq = process.argv.slice(2);

const sensors = [
    '11.1',
    '101.2',
    '112.1',
    '2103.1',
    '1103.2',
    '114.1'
];

// Generate a random number between a range
function getRandom(min,max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

// Generate select a random position of an array
function getRandomArrayPosition(lenght) {
    return Math.floor(Math.random() * lenght);
}

const options = {
    hostname: '10.100.0.102',
    port: 4000,
    path: '/save',
    method: 'GET'
};

function sendReq() {
    const queryParams = {
        id_sensor: sensors[getRandomArrayPosition(sensors.length)],
        temperatura: getRandom(0, 100),
        volatiles: getRandom(0, 3),
        humedad: getRandom(0, 200),
        co2: getRandom(0, 500)
    };

    options.path += '?' + querystring.stringify({queryParams})

    const req = http.request(options, (res) => {
        console.log(`Estado de la respuesta: ${res.statusCode}`);
        // Manejar la respuesta aquí si es necesario
    });

    req.on('error', (error) => {
        console.error(`Error al enviar la solicitud: ${error}`);
    });

    req.end();
}

// Enviar múltiples solicitudes (ajustar la cantidad según las necesidades)
for (let i = 0; i < numReq; i++) {
    sendReq();
}