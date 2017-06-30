var nodemailer = require('nodemailer');
var smtpTrans = require("nodemailer-smtp-transport")

var indexService = require('../services/IndexService')
var profileService = require('../services/ProfileService')

module.exports = function(app) {

// show the home page (will also have our login links)
  app.get('/', indexService.getIndex);
  
  app.get('/profile', isLoggedIn, profileService.getProfile);
  
  
  // show the home page (will also have our login links)
  app.get('/dashboard', isLoggedIn, function(req, res) {
    res.render('dashboard.ejs', {
            user : req.user
        });
  });

  app.get('/plans', function(req, res) {
    res.render('plans.ejs', {user : req.user});
  });
  
  app.get('/usage', function(req, res) {
    res.render('usage.ejs', {user : req.user});
  });
  
   app.get('/upgrade', function(req, res) {
    res.render('upgrade.ejs', {user : req.user});
  });
  
  
  app.get('/api', function(req, res) {
    res.render('api.ejs', {user : req.user});
  });


  app.get('/contact', function(req, res) {
    res.render('contact.ejs', {});
  });


  app.post('/contact', function(req, res) {
    var mailOpts;
    var smtpTransport = nodemailer.createTransport(smtpTrans({
      service: 'Gmail',
      auth: {
        user:  process.env.GMAIL_ADDR,
        pass:  process.env.GMAIL_PASSWORD
      }
    }));
    
    //Mail options
    mailOpts = {
      from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
      to: 'snclucas@gmail.com',
      subject: 'From QuantifiedTrade contact form from ' + req.body.name + ' <' + req.body.email + '>',
      text: req.body.message
    };   
    
    smtpTransport.sendMail(mailOpts, function(error, response) {
      
      //Email not sent
      if (error) {
        res.render('contact', {
          title: 'Raging Flame Laboratory - Contact',
          msg: 'Error occured, message not sent.',
          err: true,
          page: 'contact'
        })
      }
      //Yay!! Email sent
      else {
        res.render('contact', {
          title: 'Raging Flame Laboratory - Contact',
          msg: 'Message sent! Thank you.',
          err: false,
          page: 'contact'
        })
      }
    });
  });

};








// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}