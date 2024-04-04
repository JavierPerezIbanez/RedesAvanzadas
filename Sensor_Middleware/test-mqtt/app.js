var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var serveIndex = require('serve-index');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mqtt = require('mqtt')
var app = express();

const mqttClient = mqtt.connect('mqtt://localhost:1883');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/logs', serveIndex(path.join(__dirname, 'public/logs'))); // shows you the file list
app.use('/logs', express.static(path.join(__dirname, 'public/logs'))); // serve the actual files

//to include images
// app.use('/images', express.static('images'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function (req, res, next) {
  const now = new Date();
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const date=("["+now.toLocaleString('es-ES', options).replace(',', '')+"]");
  process.stdout.write(date)
  next()
})
app.get('/', (req, res) => {
  res.send('¡Hola desde el servidor 1!');

  const mqttMessage = JSON.stringify({
    server: 'server1',
    method: req.method,
    url: req.url
  });
  mqttClient.publish('httpRequests', mqttMessage);
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Servidor 1 escuchando en el puerto ${PORT}`);
});
