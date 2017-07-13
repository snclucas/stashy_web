var hat = require('hat');
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var invitationTokenSchema = mongoose.Schema({
    invite_token: { type: String},
    user_level: { type: String, default: "sandbox" }
});

invitationTokenSchema.post('save', function(doc) {
  var invite_token = hat();
  doc.invite_token = invite_token;
  doc.save();
});

// create the model for users and expose it to our app
module.exports = mongoose.model('InvitationToken', invitationTokenSchema);