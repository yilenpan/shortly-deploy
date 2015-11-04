var crypto = require('crypto');
var mongoose = require('mongoose');

var LinkSchema = new mongoose.Schema({
  "url": String,
  "base_url": String,
  "code": String,
  "title": String,
  "visits": {type: Number, default: 0}
});

LinkSchema.pre('save', function(next){
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

module.exports = mongoose.model('Link', LinkSchema);
