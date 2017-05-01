
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');
var flash = require('connect-flash');
var request = require('request');
var bCrypt = require('bcrypt-nodejs');
var moment = require('moment');
var paginate = require('express-paginate');

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
	//console.log(req.params.id);
	//console.log(req.session);
	var id = req.params.id;
	videos.update({ 
		'_id' : id
	}, {
		$inc : { 
			views : 1 
		}
	}).exec();
	videos.findOne( { 
		'_id' : id
	}).populate('users._userid').exec( function(err, video){
		//console.log(video);
		var user = selectuser(video.users);
		//console.log(user);
		if(user == false){
			if(req.user){
				req.flash('error','No user currently available with this video');
				res.render('users/message', {error : req.flash('error'), success: req.flash('success'), userdata: req.user});
			}
			else{
				req.flash('error','No user currently available with this video');
				res.render('message', {error : req.flash('error'), success: req.flash('success'),});
			}
		}
		else{
			videos.find({ 
				$where: function () { 
					return Date.now() - this._id.getTimestamp() < (7 * 24 * 60 * 60 * 1000)  
				}  
			}).sort({ views: -1}).limit(10).exec( function(err,vides){
                if (err){
                  req.flash('error',err);
                }
            	//console.log(vides);         
				var ip = user._userid.ip;
				var path = user.url;
				//console.log(path);
				//console.log('+++++++');
				//var port = 8887+random(0,1);
				var port = 8888;
				//console.log(port);
				//console.log(" 7777777");
				var vidurl="http://"+ip+":"+port.toString()+path;
				console.log(vidurl);
				if(req.user){
					//console.log(typeof id);console.log(id);
					var oid= mongoose.Types.ObjectId(id);console.log('4232332');
					//console.log(oid);console.log('4232332');
					users.findOne({	'_id': req.user._id,
						'upvoted': oid 
					}, function(err, id1){
						var up = false; var dn = false;
						//console.log(id1);console.log('81390310933209');
						if(id1){
							up = true; 
						}
						else{
							up = false;
						}
						users.findOne({ '_id': req.user._id,
							'downvoted': oid 
						}, function(err, id1){
							//console.log(id1);console.log('81390310933209');
							if(id1){
								dn = true; 
							}
							else{
								dn = false;
							}
							//console.log(up);
							//console.log(dn);
							res.render('users/watch', {videoss : vides, up : up, dn :dn, error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user, vusrdata: user,videodata: video});
						});
					});	
				}
				else
					res.render('videos/watch', {videoss : vides, error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, vusrdata: user, videodata: video });
				//res.send(ip);
			});	
		}
	});
});

var selectuser = function(users, lserved){
	//console.log('88888888888888888');
	//console.log(users);
	var arr = [];
	for(var i=0; i<users.length; i++){
		if(Date.now()-users[i]._userid.lastseen<1000*60*40){
			arr.push(i);
		}
	}
	//console.log('88888888888888888');
	//console.log(arr.length);
	var choice = random(0,arr.length-1);
	//console.log(choice);
	console.log(arr);
	//console.log('88888888888888888');
	if(arr.length>0)
		return users[ arr[choice] ];
	else
		return false;
}

/*router.get('/watch', function(req, res, next) {
	//var val = req.query.id;
	//console.log(req.params.id);
	var id = req.params.id;
	videos.update({ '_id' : id}, {$inc : { views : 1 }}).exec();
	videos.findOne( { '_id' : id}).populate('users._userid').exec( function(err, video){
		//console.log(video);
		var user = selectuser(video.users);
		console.log(user);
		var ip = user._userid.ip;
		var path = user.url;
		//console.log(path);
		console.log('+++++++88888888');
		var vidurl="http://"+ip+":8888/"+path;
		//var vidurl = "http://localhost:8888/v1.mp4"
		console.log(vidurl);
		if(req.user)
			res.render('users/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl, userdata: req.user});
		else
			res.render('videos/watch', {error : req.flash('error'), success: req.flash('success'), vidurl : vidurl});
		//res.send(ip);	
	});
});*/

router.get('/downvoted/:id/:toggle', function(req, res, next) {
	//var val = req.query.id;
	//console.log(req.params.id);
	var id = req.params.id;
	var toggle = req.params.toggle;
	if(toggle ==0 ){
		users.update({
			'_id' : req.user._id},{
	            $addToSet:{ 
	                'downvoted': id
	            } 
	        }, function(err, result){
                if(err){
                	console.log(err);
					req.flash('error', 'some internal error in upvoting process');
					res.redirect('/users/index');
                }
                else{
                	//console.log(result);
	    			//console.log('============');
                	if(result.nModified == 1){
	            		videos.update({ 
	            			'_id' : id
	            		}, {
	            			$inc : { 
	            				downvotes : 1 
	            			}
	            		}).exec();
	            	}
                	
                }
        });
	}
	else if(toggle == 1){
		users.update({
    		'_id': req.user._id},{
    			$pull: {
    				'downvoted': id
    			}
    		}, function( err, resultp){
	    			if(err){
	    				console.log(err);
	    				req.flash('error', 'some internal error in upvoting process');
	    				res.redirect('users/index');
	    			}
	    			else{
	    				//console.log(resultp);
		    			//console.log('=========++');
		            	if(resultp.nModified == 1){
		            		videos.update({ 
		            			'_id' : id
		            		}, {
		            			$inc : { 
		            				downvotes : -1 
		            			}
		            		}).exec();
		            	}
	    			}
	            }
	        );
	}
	res.redirect('/videos/watch/'+id);
});

router.get('/upvoted/:id/:toggle', function(req, res, next) {
	//var val = req.query.id;
	//console.log(req.params.id);
	var id = req.params.id;
	var toggle = req.params.toggle;
	if(toggle ==0 ){
		users.update({
			'_id' : req.user._id},{
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
                	//console.log(result);
	    			//console.log('============');
                	if(result.nModified == 1){
	            		videos.update({ 
	            			'_id' : id
	            		}, {
	            			$inc : { 
	            				upvotes : 1 
	            			}
	            		}).exec();
	            	}
                	
                }
                //console.log("######");
                //console.log(result);
        });
	}
	else if(toggle == 1){
		users.update({
    		'_id': req.user._id},{
    			$pull: {
    				'upvoted': id
    			}
    		}, function( err, resultp){
	    			if(err){
	    				console.log(err);
	    				req.flash('error', 'some internal error in upvoting process');
	    				res.redirect('users/index');
	    			}
	    			else{
	    				//console.log(resultp);
		    			//console.log('=========++');
		            	if(resultp.nModified == 1){
		            		videos.update({
		            		 '_id' : id
		            		}, {
		            			$inc : {
		            			 upvotes : -1 
		            			}
		            		}).exec();
		            	}
	    			}
	            }
	        );
	}
	res.redirect('/videos/watch/'+id);
});

/*router.get('/upvoted/:id', function(req, res, next) {
	//var val = req.query.id;
	console.log(req.params.id);
	var id = req.params.id;
	if(!req.user){

	}
	else{
		videos.findOne( { '_id' : id}, function(err, video){
			//console.log(video);
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
	                	users.update({
	                		'_id': req.user._id},{
	                			$pull: {
	                				'downvoted': id
	                			}
	                		}, function( err, resultp){
	                			if(err){
	                				console.log(err);
	                				req.flash('error', 'some internal error in upvoting process');
	                				res.redirect('users/index');
	                			}
	                			console.log(result);
	                			console.log(resultp);
	                			console.log('============');
	                			if(result.nModified == 1){
			                		videos.update({ '_id' : id}, {$inc : { upvotes : 1 }}).exec();
			                	}
			                	if(resultp.nModified == 1){
			                		videos.update({ '_id' : id}, {$inc : { downvotes : -1 }}).exec();
			                	}
	                	});
	                }
	                //console.log("######");
	                //console.log(result);
	        });	
		});
		res.send('upvoted');
	}
});*/

function random (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

module.exports = router;
