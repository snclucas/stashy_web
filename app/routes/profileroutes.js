var profileService = require('../services/ProfileService')

module.exports = function(app) {

  app.post('/set_add_datestamp/:add_datestamp', profileService.setAddDatestamp);
  
  
  app.post('/setdataprivacy/:data_privacy', profileService.setDataPrivacy);
  app.post('/tokens/add', profileService.addNewToken);
  app.post('/tokens/delete/:token_id', profileService.deleteToken);

  app.post('/publicendpoints/add', profileService.addNewPublicEndpoint);
  app.post('/publicendpoints/delete/:endpoint_id', profileService.deletePublicEndpoint);
}