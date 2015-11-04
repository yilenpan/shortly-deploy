var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  "username": {
                type: String,
                unique: true
              },
  "password": String
});

UserSchema.pre('save', function(next){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
         .then(function(hash){
           this.password = hash;
           next();
         })
});

UserSchema.methods.comparePassword = function(attemptedPassword, cb) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    cb(isMatch);
  })
}

module.exports = mongoose.model('User', UserSchema)
