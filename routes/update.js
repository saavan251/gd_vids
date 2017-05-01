
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');
var flash = require('connect-flash');
var multer  = require('multer');
var request = require('request');
var bCrypt = require('bcrypt-nodejs');
var moment = require('moment');


//models
var users = mongoose.model('users');
var videos = mongoose.model('videos');


router.post('/addvid', function(req, res, next) {
	var username = req.body.nick;
  	var password = req.body.password;
	users.findOne( { 
		'nick' : username
	},function(err, user) {
	    //console.log(moment());
	    if (err) {
	      	res.send('attendance error');
	    }
	    else if(!user) {
	      	res.send('sorry you are not registered');
	    }
	    else if (!isValidPassword(user, password)){
	      	res.send('sorry incorrect password');
	    }
	    else{
	      	var ip = user.ip;
			var port = 8888;
			var url="http://"+ip+":"+port.toString()+"/addlist.html";
			console.log(url);
			request.get(url, function(err, httpres, body){
				//console.log(body);
				var array = body.split('"""');
				var data = array[1].split('$$$');
				if(err){
					console.log(err);
					res.send('error in updation');
				}
				else{
					for (i=0; i< (data.length-1); i++){
						updateeach(data[i], user, array, req, res);
					}
					res.send('successfully updated');
				}
			});
	    }
	  });
});

router.post('/delvid', function(req, res, next) {
	var username = req.body.nick;
  	var password = req.body.password;
	users.findOne( { 'nick' : username},function(err, user) {
	    //console.log(moment());
	    if (err) {
	      res.send('attendance error');
	    }
	    else if(!user) {
	      res.send('sorry you are not registered');
	    }
	    else if (!isValidPassword(user, password)){
	      res.send('sorry incorrect password');
	    }
	    else{
	      	var ip = user.ip;
			var port = 8888;
			var url="http://"+ip+":"+port.toString()+"/dellist.html";
			console.log(url);
			request.get(url, function(err, httpres, body){
				//console.log(body);
				var array = body.split('"""');
				var data = array[1].split('$$$');
				if(err){
					console.log(err);
					res.send('error in deletion');
				}
				else{
					var check = true;
					for (i=0; i< (data.length-1); i++){
						deleteeach(data[i], user, array, req, res);
					}
					res.send('successfully removed videos from your share');
				}
			});
	    }
	});
});

var deleteeach = function(data, user,array, req, res){
	var elem=data;
	var userid = user._id;
	videos.findOne({
		'tth': elem
	}).populate('users._userid').exec( function(err, video){
		//console.log(video);
		//console.log(elem);
		//console.log('+++++++++++');
		if(err){
			console.log(err);
			return false;
			//res.send('some internal error in selecting your video deletion');
		}
		else if(!video){
			console.log("no such video found to delete");
			//res.send('no such video found to delete');
			return true;			
		}
		else if(video.users.length == 1 && JSON.stringify(video.users[0]._userid._id)== JSON.stringify(userid) ){
			videos.remove({ 
				'tth': elem 
			}, function(err){
				if(err){
					console.log(err);
					return false;
				}
				else
					return true;
			})
		}
		else if(video.users.length > 1){
			var oid= mongoose.Types.ObjectId(userid);
			videos.update({
				'tth' : elem
			},{
				$pull : {
					"users" :{
						'_userid': oid
					}
				}
			}).exec( function(err, video){
				if(err){
					console.log(err);
					return false;
				}
				else
					return true;
			});
		}
		//console.log('------------');
	});
}

var updateeach = function(data, user,array, req, res){
	var elem=data.split(',,,,');
	//console.log(elem[0]);
	//console.log(elem[1]);
	var userid = user._id;
	videos.findOne({
		'tth': elem[1]
	}).populate('users._userid').exec( function(err, video){
		//console.log(video);
		//console.log(elem[1]);
		//console.log('+++++++++++');
		if(err){
			console.log(err);
			req.flash('error', 'some internal error in refreshing file');
			res.redirect('settings');
		}
		else if(!video){
			//console.log("$$$$$$$$$$$$$$$$$");
			var ct = elem[0].lastIndexOf('/')+1;
			var video = new videos({
				tth: elem[1],
				format: elem[0].substring(elem[0].lastIndexOf('.')+1,elem[0].length),
				users: [{
					_userid: userid,
					title: elem[0].substring(ct,elem[0].length -4 ),
					url: elem[0],
					version: parseInt(array[0])
				}]
			});
			video.save(function(err, video){
				if(err){
					console.log(err);
					//req.flash('error', 'some internal error in adding new video '+ elem[1]);
					res.send('error in updating videos');
				}
				console.log('updated'+ elem[0]);
			});
		}
		else{
			var flag=1;
			//console.log('6666666666');
			for(var j=0; j<video.users.length; j++){
				if (JSON.stringify(video.users[j]._userid._id)== JSON.stringify(userid) ) {
					flag=0;  
					var ct = elem[0].lastIndexOf('/')+1; 
	                videos.update({
	                	"_id": video._id, 
	                	"users._userid": userid
	                }, 
					{
						$set: {
							"users.$.title": elem[0].substring(ct,elem[0].length -4),
							"users.$.version": parseInt(array[0]),
							"users.$.url": elem[0]	
						}
					}).exec();
	            	req.flash('success', 'successful');
	            }
			}
			if(flag == 1){
				var ct = elem[0].lastIndexOf('/')+1;
			    videos.update({
			    	'_id' : video._id},{
		            $push:{ 
		                'users': {
		                    _userid: userid,
							title: elem[0].substring(ct,elem[0].length -4),
							url: elem[0],
							version: parseInt(array[0])
		                }
		            } 
		        }, function(err){
	                if(err){
	                	console.log(err);
						req.flash('error', 'some internal error in adding new user to found vidoe '+ elem[1]);
						res.redirect('settings');
	                }
	            });
			}
		}
	});
}


var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function random (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

module.exports = router;