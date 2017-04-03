var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var videoSchema = new Schema({
	title:{
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
	description:{
		type: String,
		required: false
	},
	urls: {
		type: [String],
		required: false
	}

});
module.exports = mongoose.model('videos', videoSchema);
