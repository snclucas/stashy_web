var request = require('request');

// Local libraries
var gaussian = require('../lib/gaussian.js');


module.exports = {

  generateInitialData: function(mean, variance) {
    
    var distribution = gaussian(mean, variance);
    // Take a random sample using inverse transform sampling method.
    var sample = distribution.ppf(Math.random());
    
    return sample;
    
  },


};