// server.js

// set up ======================================================================
// get all the tools we need
var compression = require('compression')
var express  = require('express');
var app      = express();
app.use(compression())

var helmet = require('helmet')
app.use(helmet())

var port     = process.env.SERVER_PORT;
var mongoose = require('mongoose');
// Use bluebird
mongoose.Promise = require('bluebird');

var passport = require('passport');
var flash    = require('connect-flash');
var path = require('path');
var i18n = require("i18n");
var flash = require('express-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var MongoStore = require('connect-mongo/es5')(session);

var adminService = require('./app/services/AdminService');

var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use(i18n.init);

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

i18n.configure({
    locales:['en', 'fr'],
    directory: __dirname + '/locales'
});

//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies

app.set('view engine', 'ejs'); // set up ejs for templating

app.use('/static', express.static(path.join(__dirname, 'public')))

// required for passport
//app.use(session({ secret: process.env.SESSION_SECRET })); // session secret

app.use(session({
  secret: 'ilovescotchscotchyscotchscotch' ,
  cookie : {
    maxAge: 3600000, // see below
    rolling: true,
    resave: true, 
  },
  resave: true,
  saveUninitialized: true,
  rolling: true,
    store   : new MongoStore({
        url  : configDB.url
    })
}));


app.use(passport.initialize());

app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});

// Check the mode of the site
app.use(adminService.getSiteMode);





// routes ======================================================================
require('./app/routes/routes.js')(app);
require('./app/routes/loginroutes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/routes/profileroutes.js')(app);

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// launch ======================================================================
app.listen(port);
console.log('Server started on port ' + port);

// Export for testing
module.exports = app;
