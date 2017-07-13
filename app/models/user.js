var hat = require('hat');
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    isAdmin: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    tokens: [{
      name: String,
      token: String
    }],
    allowedPublicEndpoints: {type: Number, default:1},
    publicEndpoints: [{
      name: String,
      endpoint: String
    }],
    accountType: {type: String, default:"Free"},
    allowedTokens: {type: Number, default:1},
    dataPrivacy: {type: String, default:"public"},
    addDatestampToPosts: {type: Boolean, default: true},
    local            : {
        email        : String,
        password     : String,
        displayName  : {type: String, default: "notset"},
        hasVerifiedEmail: {type: Boolean, default: false},
        verifyEmailToken: String,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        tokenSecret  : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

userSchema.post('save', function(doc) {
//   if(doc.local.hasVerifiedEmail === false) {
//     var verifyEmailToken = hat();
//     doc.local.verifyEmailToken = verifyEmailToken;
//     doc.save();
//   }
});


userSchema.methods.getSafeUser = function() {
   var user = this;
   //filter user as per your requirements here.
  
  

   return user;
}

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
