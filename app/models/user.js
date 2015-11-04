// var db = require('../config');
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
//
// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function(){
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function(){
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });
// module.exports = User;
