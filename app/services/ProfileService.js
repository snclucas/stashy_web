var hat = require('hat');
var crypto = require('crypto');
var User = require('../models/user');
var config = require('../../config/app');
var hat = require('hat');


exports.verifyUserEmail = function(req, res) {
	var verification_code = req.params.verification_code;
	
	User.findOne(
		{
			"local.verifyEmailToken": verification_code,
			"local.hasVerifiedEmail": false
		}, function(err, user){

			if(!err && user != null) {
				
				user.local.hasVerifiedEmail = true;
				user.local.verifyEmailToken = "";
				
				user.save(function(user_save){
					req.login(user, function (err) {
                if ( ! err ){
									req.flash('success_messages', 'Email verified.');
                  res.redirect('/profile');
                } else {
                  var error_messages = []
									error_messages.push("Invalid or expired verification token.")
									res.render('activate.ejs', {
    							user: null,
									error_messages: error_messages
  								});
                }
            })
				});
				
			}
			else {
				var error_messages = []
				error_messages.push("Invalid or expired verification token.")
				res.render('activate.ejs', {
    			user: null,
					error_messages: error_messages
  			});
			}
		
	});
};


exports.getUserProfile = function(req, res) {
	var authenticatedUser = req.user;
	var is_ajax_request = req.xhr;

	if (is_ajax_request) {
		res.json({
			user: authenticatedUser,
			redirect: '/profile'
		});
	} else {
		var error_messages = []
		if(authenticatedUser.local.hasVerifiedEmail === false)
			error_messages.push("You need to verify your email address. Instructions are sent to your email address");
		res.render('profile.ejs', {
			user: authenticatedUser,
			error_messages: error_messages
		});
	}
};


exports.addNewToken = function(req, res) {
	var authenticatedUser = req.user;
	var token_name = req.body.token_name;
	if(token_name.length === 0) {
		req.flash('error_messages', 'Invalid token name.');
		res.redirect('/profile');
		return;
	}

	var userFindCriteria = {
		_id: authenticatedUser.id
	};

	User.findOne(userFindCriteria)
		.exec(function(err_user, user) {

			var tokens_allowed = user.allowedTokens;
			var tokens_created = 0;
			if (user.tokens)
				tokens_created = user.tokens.length;

			var tokens_left = tokens_allowed - tokens_created;

			if (tokens_left > 0) {
				var secretKey = config.token.secret;
				var token = hat();
				user.tokens.push({
					"name": slugify(token_name),
					"token": token
				});
				user.save(function(err, user) {
					req.flash('success_messages', 'Token added.');
					res.redirect('/profile');
				})
			} else {
				req.flash('error_messages', 'You cannot add another token to your account.');
				res.redirect('/profile');
			}
		});
}


exports.deleteToken = function(req, res) {
	var authenticatedUser = req.user;
	var token_id = req.params.token_id;

	var userFindCriteria = {
		_id: authenticatedUser.id
	};

	User.find(userFindCriteria)
		.exec(function(err_user, user) {

			if (!err_user) {
				var user_tokens = user[0].tokens;

				user_tokens.forEach(function(token) {
					if (token_id.localeCompare(token._id) === 0) {
						var index = user_tokens.indexOf(token);
						user_tokens.splice(index, 1)
					}
				})
				user[0].save(function(err, user) {
					res.redirect('/profile');
				})
			} else {
				req.flash('error_messages', 'There was a problem deleting token.');
				res.redirect('/profile');
			}
		});
}



exports.addNewPublicEndpoint = function(req, res) {
	var authenticatedUser = req.user;
	var endpointname = req.body.endpointname;

	var userFindCriteria = {
		_id: authenticatedUser.id
	};
	
	User.findOne(userFindCriteria)
		.exec(function(err_user, user) {

			var endpoints_allowed = user.allowedPublicEndpoints;
			var endpoints_created = 0;
			if (user.publicEndpoints)
				endpoints_created = user.publicEndpoints.length;

			var endpoints_left = endpoints_allowed - endpoints_created;

			if (endpoints_left > 0) {

				var endpoint = crypto.randomBytes(6).toString('hex');

				user.publicEndpoints.push({
					"name": slugify(endpointname),
					"endpoint": endpoint
				});

				user.save(function(err, user) {
					res.json({
						status: 'success',
						endpoint: endpoint,
						user: authenticatedUser,
						redirect: '/profile'
					})
				})
			} else {
				res.json({
					status: 'fail',
					endpoint: '',
					user: authenticatedUser,
					redirect: '/upgrade'
				})
			}
		});
}



exports.deletePublicEndpoint = function(req, res) {
	var authenticatedUser = req.user;
	var endpoint_id = req.params.endpoint_id;
	
	var userFindCriteria = {
		_id: authenticatedUser.id
	};
	
	User.findOne(userFindCriteria)
		.exec(function(err_user, user) {
			var user_endpoints = user.publicEndpoints;
			user_endpoints.forEach(function(endpoint) {
				if (endpoint_id.localeCompare(endpoint._id) === 0) {
					var index = user_endpoints.indexOf(endpoint);
					user_endpoints.splice(index, 1)
				}
			})
			user.save(function(err, user) {
				res.redirect('/profile');
			})
		});
}



exports.setDataPrivacy = function(req, res) {
	var authenticatedUser = req.user;
	var data_privacy = req.params.data_privacy;
	
	var userFindCriteria = {
		_id: authenticatedUser.id
	};

	User.findOne(userFindCriteria)
		.exec(function(err_user, user) {

			user.dataPrivacy = data_privacy.toLowerCase();

			user.save(function(err, user) {
				res.redirect('/profile');
			})
		});

}


exports.setAddDatestamp = function(req, res) {
	var authenticatedUser = req.user;
	var add_datestamp = req.params.add_datestamp;
	
	var userFindCriteria = {
		_id: authenticatedUser.id
	};

	User.findOne(userFindCriteria)
		.exec(function(err_user, user) {

			console.log(add_datestamp.toLowerCase());
			user.addDatestampToPosts = add_datestamp.toLowerCase();

			user.save(function(err, user) {
				res.redirect('/profile');
			})
		});

}


function slugify(text) {

	return text.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}