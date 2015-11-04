var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');
var User = require('../app/models/user');
var Link = require('../app/models/link');

// Set up development/production dbs
mongoose.connect('mongodb://localhost/Shortly', function(err){
  if (err) {
    console.log('Error connecting to MongoDB, ', err);
  }
});

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, links) {
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
  Link.findOne({url: uri}).exec(function(err, link){
    if (err) {
      console.log('error retrieving link', err);
      res.redirect('/');
    } else if (link) {
      res.redirect(link.url);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading title', err);
        }

        var newLink = new Link({
                            url: uri,
                          title: title,
                       base_url: req.headers.origin
                              });

        newLink.save(function(err, newLink) {
          if (err) {
            console.log('Error signing up new user')
            res.redirect('/signup')
          } else {
            res.send(200, newLink)
          }
        });
      });
    }
  })
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;


  User.findOne({username: username}).exec(function(err, user){
    if (err || !user) {
      res.sendStatus(501);
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var newUser = new User({username: username, password: password});

  newUser.save(function(err) {
    if (err) {
      res.redirect('/signup')
    } else {
      util.createSession(req, res, this);
    }
  });

};

exports.navToLink = function(req, res) {

  Link.findOne({code: req.params[0]}).exec(function(err, link){
    if (err || !link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save();
      res.redirect(link.url);
    }
  })
};
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
