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
	issharer:{
		type:Boolean,
		default:false
	},
	lastseen:{
		type: Date,
        default: Date.now
	},
	upvoted:[{
			type: Schema.Types.ObjectId,
			ref: 'videos'
	}],
	downvoted:[{
			type: Schema.Types.ObjectId,
			ref: 'videos'
	}],
	videos:[{
			type: Schema.Types.ObjectId,
			ref: 'videos'
	}]
});
module.exports = mongoose.model('users', userSchema);
