var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	full_name:{
		type: String,
		required: true
	},
	nick:{
		type: String,
		required: true
	},
	level:{
		type: Number,
		required:false
	},
	email:{
		type: String,
		required: false
	},
	altEmail:{
		type: String,
		unique : false,
	},
	lastLogin: {
		type: String,
		unique : false,
		default : "Never"
	},
	password:{
		type: String,
		required: false,
	},
	_login:{
		type:Boolean,
		default:true
	},
});
module.exports = mongoose.model('users', userSchema);
