var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
//connecting to Database
mongoose.connect('localhost:27017/db_name');
var Schema = mongoose.Schema;

//Defining user schema
var UserSchema = new Schema({
		name: String,
		username:{type:String, required:true, index:{unique:true}},
		password:{type:String, required:true, select:false}
});

//hashing the password before the user is saved
UserSchema.pre('save', function(next){
	var user=this;
	//hash the password if the password is changed or user is new
	if(!user.isModified('password')) return next();
	//generating hash
	bcrypt.hash(user.password,null,null,function(err,hash){
	if(err) return next(err);
	//change the password to the hashed version
	user.password=hash;
	next();
	});
});

//comparision of given password with the database hash
UserSchema.methods.comparePassword = function(password){
	var user = this;
	return bcrypt.compareSync(password,user.password)
};
//return the model
module.exports = mongoose.model('User', UserSchema);
	
