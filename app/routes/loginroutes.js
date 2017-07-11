var authenticationService = require('../services/AuthenticationService');

var config = require('../../config/app'); // use this one for testing

var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var mailgun = require('mailgun-js')({
  apiKey: process.env.mailgun_api_key,
  domain: process.env.mailgun_domain
});

var User = require('../models/user');

module.exports = function(app, passport) {

  function getMailOptions(to, from, subject, text) {
    return {
      to: to,
      from: from,
      subject: subject,
      text: text
    };
  }

  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    if (req.isAuthenticated())
      res.render('index.ejs', {
        user: req.user,
        message: req.flash('loginMessage')
      });
    else
      res.render('login.ejs', {
        user: req.user,
        message: req.flash('loginMessage')
      });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    if (req.isAuthenticated())
      res.render('index.ejs', {
        user: req.user,
        message: req.flash('loginMessage')
      });
    else
      res.render('signup.ejs', {
        user: req.user,
        message: req.flash('signupMessage')
      });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the index page if there is an error
    failureFlash: true // allow flash messages
  }));

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/projects',
      failureRedirect: '/'
    }));

  // twitter --------------------------------

  // send to twitter to do the authentication
  app.get('/auth/twitter', isLoggedIn, passport.authenticate('twitter', {
    scope: 'email'
  }));

  // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/projects',
      failureRedirect: '/'
    }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/projects',
      failureRedirect: '/'
    }));

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // locally --------------------------------
  app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', {
      message: req.flash('loginMessage')
    });
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/projects', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/connect/facebook', passport.authorize('facebook', {
    scope: 'email'
  }));

  // handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // twitter --------------------------------

  // send to twitter to do the authentication
  app.get('/connect/twitter', passport.authorize('twitter', {
    scope: 'email'
  }));

  // handle the callback after twitter has authorized the user
  app.get('/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/connect/google', passport.authorize('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authorized the user
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // facebook -------------------------------
  app.get('/unlink/facebook', isLoggedIn, function(req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // twitter --------------------------------
  app.get('/unlink/twitter', isLoggedIn, function(req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // google ---------------------------------
  app.get('/unlink/google', isLoggedIn, function(req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });




  app.get('/forgot', function(req, res) {
    res.render('forgot.ejs', {
      user: req.user,
      message: req.flash('loginMessage')
    });
  });





  app.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        var criteria = {
          $and: [{
            "local.displayName": req.body.name.toLowerCase()
          }, {
            "local.email": req.body.email.toLowerCase()
          }]
        };
        console.log(criteria);
        User.findOne(criteria, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.render('forgot.ejs', {
              user: req.user,
              message: 'No user found'
            });
          }

          user.local.resetPasswordToken = token;
          user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {

        var text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        var mailOptions = getMailOptions(user.local.email, 'passwordreset@stashy.io', 'Password Reset', text);

        mailgun.messages().send(mailOptions, function(error, body) {
          //           res.render('index', {
          //               user: req.user,
          //               message: 'An e-mail has been sent to ' + user.local.email + ' with further instructions.'
          //            });
          req.session.sessionFlash = {
            type: 'success',
            message: 'An e-mail has been sent to ' + user.local.email + ' with further instructions.'
          }
          res.redirect("/"); //redirect vs render
        });

      }
    ], function(err) {
      if (err) return next(err);
      return res.render('forgot.ejs', {
        user: req.user,
        message: 'An email has been sent with your reset link.'
      });
    });
  });




  app.get('/reset/:token', function(req, res) {
    console.log('re= ' + req.params.token);
    User.findOne({
      'local.resetPasswordToken': req.params.token,
      'local.resetPasswordExpires': {
        $gt: Date.now()
      }
    }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        user: req.user,
        message: req.flash('loginMessage')
      });
    });
  });



  app.post('/reset/:token', function(req, res) {
    console.log('re= ' + req.params.token);
    async.waterfall([
      function(done) {
        User.findOne({
          'local.resetPasswordToken': req.params.token,
          'local.resetPasswordExpires': {
            $gt: Date.now()
          }
        }, function(err, user) {
          console.log(err);
          if (!user) {

            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          user.local.password = user.generateHash(req.body.password);
          // Check if same as confirm TODO!!!!!!!!!!!!!!!!!!!!!!!
          user.local.resetPasswordToken = undefined;
          user.local.resetPasswordExpires = undefined;

          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        var text = 'Hello,\n\nThis is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n';
        var mailOptions = getMailOptions(user.local.email, 'passwordreset@stashy.io', 'Your password has been changed', text);

        mailgun.messages().send(mailOptions, function(error, body) {
          res.render('index', {
            user: req.user,
            message: 'An e-mail has been sent to ' + user.local.email + ' with further instructions.'
          });
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });


  app.get('/change_password', function(req, res) {
    res.render('change_password', {
      user: req.user,
      message: req.flash('changePasswordMessage')
    });
  });


  app.post('/change_password', function(req, res) {
    var user = req.user;

    var password1 = req.body.password;
    var password2 = req.body.password_confirm;

    if (password1.length === 0 || password2.length === 0) {
      req.flash('changePasswordMessage', 'Passwords cannot be blank');
      res.render('change_password', {
        user: req.user,
      });
    } else if (password1 === password2) {
      user.local.password = user.generateHash(password1);

      user.save(function(err) {
        req.flash('changePasswordMessage', 'Password changed');
        res.redirect('/profile');
      });
    } else {
      req.flash('changePasswordMessage', 'Passwords do not match.');
      res.render('change_password', {
        user: req.user,
      });
    }

  });


};








// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}