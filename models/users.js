var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	full_name:{
		type: String,
		required: true
	},
	nick:{
		type: String,
		required: true,
		unique: true
	},
	level:{
		type: Number,
		required:false
	},
	email:{
		type: String,
		required: false
	},
	ip:{
		type: String,
		required: false
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
	is_sharer:{
		type:Boolean,
		default:false
	},
});
module.exports = mongoose.model('users', userSchema);
