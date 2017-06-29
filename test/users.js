var async = require('async');


var should = require('should'),
  //_ = require('lodash'),
  app = require('../server'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  request = require('supertest');

var requestp = require("supertest");
var agent1 = requestp.agent(app)

var user, user1;

describe('GET /api/jobs', function() {
  beforeEach(function(done) {
    user = new User({
      provider: 'local',
      name: 'Fake User',
      email: 'test@test.com',
      password: 'password'
    });

    // Clear users before testing
    User.remove().exec();

    request(app)
      .post('/api/users')
      .send(user)
      // end handles the response
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        res.should.have.status(200);
        res.body._id.should.exist;

        user1 = request.agent(app); //user1 will be used in all subsequent tests since he's supposed to be authenticated
        user1
          .post('/api/session')
          .send({
            email: user.email,
            password: user.password
          })
          .end(function(err, res) {
            if (err) throw err;
            // user1 will manage its own cookies
            // res.redirects contains an Array of redirects
            res.should.have.status(200);

            done();
          });
      });
  });

  afterEach(function(done) {
    User.remove().exec();
    done();
  });

  it('should create a job by user1', function(done) {
    var job = {
      //jobs stuff
    };

    user1
      .post('/api/jobs')
      .send(job)
      .expect(200) //It fails here, getting 401 Unauthenticated. Session is using passport local strategy
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);

        done();
      });
  });
});


// beforeEach(function (done) {
//   console.log("In here");
//     // Clear data before testing
//     user1 = {
//         name: 'Fake User',
//         username: 'test',
//         email: 'test@test.com',
//         password: 'password'
//     };

//     user2 = {
//         name: 'Fake User2',
//         username: 'test2',
//         email: 'test2@test.com',
//         password: 'password2'
//     };


//     function createUser1(cb){
//         agent1
//             .post('/api/users')
//             .send(user1)
//             .expect(200)
//             .end(function(err, res){
//                 if ( err ) throw err;

//                 loginUser1.call(null, cb);
//             });
//     }

//     function loginUser1(cb){
//         agent1
//             .post('/api/session')
//             .send({
//                 email: user1.email
//                 , password: user1.password
//             })
//             .expect(200)
//             .end(function(err, res){
//                 if ( err ) throw err;

//                 loggedInUser1 = res.body;

//                 cb();
//             });
//     }

//     function createUser2(cb){
//         agent2
//             .post('/api/users')
//             .expect(200)
//             .send(user2)
//             .end(function(err, res){
//                 if (err) throw err;

//                 loginUser2.call(null, cb);
//             });
//     }

//     function loginUser2(cb){
//         agent2
//             .post('/api/session')
//             .send({
//                 email: user2.email
//                 , password: user2.password
//             })
//             .end(function(err, res){
//                 if ( err ) throw err;

//                 loggedInUser2 = res.body;

//                 cb();
//             });
//     }

//     async.series([function(cb){
//         createUser1(cb);
//     }, function(cb){
//         createUser2(cb);
//     }], done);

// });

// afterEach(function (done) {
//     User.remove()
//         .execQ()
//         .then(function(){
//             return Job.remove().execQ()
//         })
//         .done(function(){
//             done();
//         });
// });