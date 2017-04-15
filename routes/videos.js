
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
	videos.update({ '_id' : id}, {$inc : { views : 1 }}).exec();
	videos.findOne( { '_id' : id}).populate('users._userid').exec( function(err, video){
		console.log(video);
		var user = selectuser(video.users);
		console.log(user);
		var ip = user._userid.ip;
		var path = user.url;
		//console.log(path);
		//console.log('+++++++');
		var vidurl="http://"+ip+path;
		console.log(vidurl);
		if(req.user)
			res.render('users/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user});
		else
			res.render('videos/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl});
		//res.send(ip);	
	});
});

router.get('/watch', function(req, res, next) {
	//var val = req.query.id;
	/*console.log(req.params.id);
	var id = req.params.id;
	videos.update({ '_id' : id}, {$inc : { views : 1 }}).exec();
	videos.findOne( { '_id' : id}).populate('users._userid').exec( function(err, video){
		console.log(video);
		var user = selectuser(video.users);
		console.log(user);
		var ip = user._userid.ip;
		var path = user.url;
		//console.log(path);
		//console.log('+++++++');
		//var vidurl="http://"+ip+path;*/
		var vidurl = "http://localhost:8888/movie.mp4"
		console.log(vidurl);
		if(req.user)
			res.render('users/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user});
		else
			res.render('videos/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl});
		//res.send(ip);	
	//});
});

router.get('/upvoted/:id', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	if(!req.user){

	}
	else{
		videos.findOne( { '_id' : id}, function(err, video){
			console.log(video);
			users.update(
				{'_id' : req.user._id},{
		            $addToSet:{ 
		                'upvoted': id
		            } 
		        }, function(err, result){
	                if(err){
	                	console.log(err);
						req.flash('error', 'some internal error in upvoting process');
						res.redirect('/users/index');
	                }
	                else{
	                	if(result.nModified == 1){
	                		videos.update({ '_id' : id}, {$inc : { upvotes : 1 }}).exec();
	                	}

	                }
	                console.log("######");
	                console.log(result);
	        });	
		});
		res.send('upvoted');
	}
});

var selectuser = function(users){
	return users[0];
}

module.exports = router;
