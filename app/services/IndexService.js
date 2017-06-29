

exports.getIndex = function(req, res) {
  var authenticatedUser;
  if(req.isAuthenticated()) {
        authenticatedUser = req.user
  }
  res.render('index.ejs', {
    is_logged_in: req.isAuthenticated(),
    user: authenticatedUser
  });
};
