var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var videoSchema = new Schema({
	tth: {
		type: String,
		required: true
	},
	upvotes:{
		type: Number,
		default : 0
	},
	downvotes:{
		type: Number,
		default : 0
	},
	views:{
		type: Number,
		default : 0
	},
	users:[{
		_userid:{
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		title:{
			type: String,
			required: false
		},
		description:{
			type: String,
			required: false
		},
		url: {
			type: String,
			required: false
		},
		version: {
			type: Number,
			required: false,
			default : 0
		}
	}],
	format: {
		type: String,
		required: true
	}
});
module.exports = mongoose.model('videos', videoSchema);
