var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var serveIndex = require('serve-index');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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
/**
 * This log the time of the call in the console in human-readable test
 */
app.use(function (req, res, next) {
  const now = new Date();
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const date=("["+now.toLocaleString('es-ES', options).replace(',', '')+"]");
  process.stdout.write(date)
  console.log(req.params)
})
/**
 * This is the port that is open in localhost to access this middleware
 */
var port=4002
app.listen(port, () => {
  console.log(`Middleware 2 is running on port: ${port}`);
  console.log('Logging data sended:');
});

module.exports = app;
