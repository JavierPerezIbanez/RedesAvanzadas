const express = require('express');
const app = express();
//Time Logger
app.use(function (req, res, next) {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const date=("["+now.toLocaleString('es-ES', options).replace(',', '')+"]");
    process.stdout.write(date)
    next()
})

app.get('/', (req, res) => {
    res.send('¡Hola desde el servidor 2!');
});

const PORT = 4002;
app.listen(PORT, () => {
    console.log(`Servidor 2 escuchando en el puerto ${PORT}`);
});