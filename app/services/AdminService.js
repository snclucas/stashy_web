var config = require('../../config/app');

var SiteConfig = require('../models/siteconfig');



exports.getSiteMode = function(req, res, next) {
  if ( req.path == '/') return next();
  SiteConfig.findOne({
    config: 1
  }, function(err, siteConfig) {
    if (err || !siteConfig) {
      res.json({
        status: 0,
        message: "No siteConfig found."
      });

      var newSiteConfig = SiteConfig({
        config: 1,
        mode: "operational",
        maintenenceMsg: ""
      });

      newSiteConfig.save(function(err, config) {
        res.redirect('/');
      });
    } else {
      if (siteConfig.mode === "operational")
        return next();
      else 
        res.redirect('/');
    }
  });
}