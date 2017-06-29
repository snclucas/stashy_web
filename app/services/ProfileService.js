var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var User = require('../models/user');
var config = require('../../config/app');

exports.getProfile = function(req, res) {
	var authenticatedUser = req.user;
	var is_ajax_request = req.xhr;

	if (is_ajax_request) {
		res.json({
			user: authenticatedUser,
			redirect: '/profile'
		});
	} else {
		res.render('profile.ejs', {
			user: authenticatedUser
		});
	}
};


exports.addNewToken = function(req, res) {
	var authenticatedUser = req.user;
	var tokenname = req.body.tokenname;

	User.findOne({
			_id: authenticatedUser.id
		})
		.exec(function(err_user, user) {

			var tokens_allowed = user.allowedTokens;
			var tokens_created = 0;
			if (user.tokens)
				tokens_created = user.tokens.length;

			var tokens_left = tokens_allowed - tokens_created;

			if (tokens_left > 0) {

				var claims = {
					sub: {
						username: authenticatedUser.local.displayName,
						email: authenticatedUser.local.email
					},
					issuer: 'https://stashy.io',
					permissions: 'read-write'
				}
				var secretKey = config.token.secret;
				console.log(secretKey);
				var token = jwt.sign(claims, secretKey);
				user.tokens.push({
					"name": slugify(tokenname),
					"token": token
				});
				user.save(function(err, user) {
					res.json({
						status: 'success',
						token: token,
						user: authenticatedUser,
						redirect: '/profile'
					})
				})
			} else {
				res.json({
					status: 'fail',
					token: '',
					user: authenticatedUser,
					redirect: '/upgrade'
				})
			}
		});
}


exports.deleteToken = function(req, res) {
	var authenticatedUser = req.user;
	var token_id = req.params.token_id;

	User.find({
			_id: authenticatedUser.id
		})
		.exec(function(err_user, user) {

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
		});
}



exports.addNewPublicEndpoint = function(req, res) {
	var authenticatedUser = req.user;
	var endpointname = req.body.endpointname;

	User.findOne({
			_id: authenticatedUser.id
		})
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
	User.findOne({
			_id: authenticatedUser.id
		})
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
	
	User.findOne({
			_id: authenticatedUser.id
		})
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
	
	User.findOne({
			_id: authenticatedUser.id
		})
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