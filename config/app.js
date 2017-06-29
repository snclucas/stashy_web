module.exports = {

  'app': {
    'baseurl': 'http://stashy.io'
  },

  'api': {
    'url': '/api/',
    'contentType': 'application/json'
  },

  'text': {
    'meta_regex': '/api/'
  },
  
  'routes': {
    'models': '/models/'
  },
  
  'token': {
    'secret': process.env.TOKEN_SECRET,
  }

};
