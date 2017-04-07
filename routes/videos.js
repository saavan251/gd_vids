
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');
var flash = require('connect-flash');
var request = require('request');
var bCrypt = require('bcrypt-nodejs');
var moment = require('moment');


//models
var users = mongoose.model('users');
var videos = mongoose.model('videos');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*router.use(function(req, res, next) {
	if(!req.user) {
		res.render('signin',{error : req.flash('error'), success: req.flash('success')});
	}
	else
  		next();
});*/


router.get('/watch/:id', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	videos.findOne( { '_id' : id},function(err, video) {
		console.log(video);
		var ip = selecturl( video.urls);
		var vidurl="http://"+ip;
		console.log(vidurl);
		res.render('videos/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user});
		//res.send(ip);	
	});
});

var selecturl = function(urls){
	return urls[0];
}

module.exports = router;
