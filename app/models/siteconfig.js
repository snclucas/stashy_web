var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SiteConfigSchema = new Schema({
  config: {type: Number, default: 1},
  mode: {type: String, default: "operational"},
  maintenanceMsg: {type: String, default: ""}
});

module.exports = mongoose.model('SiteConfig', SiteConfigSchema)