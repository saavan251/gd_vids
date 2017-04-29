var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var swig = require('swig');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var passport = require('passport');
var request = require('request');
var mongoose = require('mongoose');
var moment = require('moment');
var fs = require('fs');
var flash = require ('connect-flash');
var mongoosesession = require('mongoose-session');
var paginate = require('express-paginate');
mongoose.connect('mongodb://127.0.0.1/gamedrone');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});

var index = require('./routes/index');
var users = require('./routes/users');
var videos = require('./routes/videos');
var update = require('./routes/update');


var app = express();

// view engine setup- session collection name
app.set('views', path.join(__dirname, 'views'));
app.engine('html',swig.renderFile);
app.set('view engine', 'html');

app.locals.moment = moment;
swig.setDefaults({ locals: { now : function () { return new Date(); } }});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(expressSession({
  secret: 'hY797S2APCzSkjhgndFbsngMSd7dy',
  resave: true,
  saveUninitialized: true
  //see alumni repo
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', index);
app.use('/users', users);
app.use('/videos', videos);
app.use('/update', update);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
