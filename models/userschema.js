var mongoose = require('mongoose');
//library for password to improve security
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
// create user schema
var UserSchema = new Schema({
email:{type:String,unique:true, lowercase:true},
password:String,
profile:{
  name:{type:String, default:''},
  picture:{type:String, default:''}
},
address:String,
history:[{
  date:Date,
  paid:{type: Number, default: 0}
  }]

});

// hash the password before we save ot to the DB
UserSchema.pre('save',function(next){
var user = this;// 'this' refer to the newly built obj using UserSchema
if(!user.isModified('password')) return next();
//salt is random data created. genSalt will return a 'salt'
bcrypt.genSalt(10, function(err,salt){
    if(err) return next(err);
    //'hash' is function to continue modify 'salt' data and password typed in
    bcrypt.hash(user.password, salt, null, function(err,hash){
    if(err) return next(err);
    user.password = hash;
    next();
    });

  });

});



//compare password user input with the password in DB
UserSchema.methods.comparePassword = function(password){

  return bcrypt.compareSync(password,this.password);
}
//In this way, app.js can user your model as 'User'
module.exports = mongoose.model('User', UserSchema);
