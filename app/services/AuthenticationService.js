var User = require('../models/user');

exports.checkAuthToken = function(req, res, next) { 
  var header = (typeof req.headers.authorization === 'undefined') ? '' : req.headers.authorization;
  var token = header.split(/\s+/).pop();
  if (req.user)
    return next();
  else {
    User.find({
      token: token
    }, function(err, user) {
      if (err || !user.length) {
        res.status(401).json({
          message: 'Incorrect token auth'
        });
        //req.user = user;
        //return next();
      } else {
        req.user = user[0];
        return next();
      }
    });
  }
}


exports.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}