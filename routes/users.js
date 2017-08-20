
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');
var path=require('path');
var flash = require('connect-flash');
var multer  = require('multer');
var request = require('request');
var bCrypt = require('bcrypt-nodejs');
var moment = require('moment');
var paginate = require('express-paginate');
var users = mongoose.model('users');
var videos = mongoose.model('videos');
var fileUpload = false;
var fileFilter = false;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  //res.render('about');
});

router.use( function(req, res, next) {
	console.log(req.url);
	if(!req.user) {
		res.render('signin',{error : req.flash('error'), success: req.flash('success')});
	}
	else
  		next();
});

var storage = multer.diskStorage({
	destination: function (req, file, cb) {  
	    if (file.fieldname == 'attach')     
	        cb(null, 'public/uploads/') 
	},
  	filename: function (req, file, cb) {        
    	if(file.mimetype=="image/jpeg"){             
       		cb(null, req.user.nick + '.jpg'); 
    	}
    	else if(file.mimetype=="image/png"){             
        	cb(null, req.user.nick + '.png');          
    	}  
  	}
});

var fileFilter = function(req,file,cb){
  	fileUpload = true;
  	console.log(file);
  	console.log('++++');
  	if (file.mimetype=="image/jpeg") {
    	cb(null,true);
  	} else {
    	fileFilter = true;
    	cb(null,false);
  	}
} 

var uploads = multer({ storage: storage,
  	fileFilter:fileFilter,
  	limits:{
    	fileSize: 5000*5000
  	} 
});

var upload = uploads.fields([{ name: 'attach' }]);

router.get('/signin', function(req, res, next) {
	if(!req.user){
		res.render('signin',{error : req.flash('error'), success: req.flash('success')});
	}
    else{
    	res.redirect('/users/index');
    }
});

router.get('/index',function(req,res,next){
	videos.find({}).populate('users._userid').limit(10).sort(
        {
            '_id': -1
        }).exec( function(err,vids){
	    if (err){
        	req.flash('error',err);
        	res.redirect('/message');
        }
        else if(vids.length == 0) {
        	//console.log(vids);
        	req.flash('error', '0 videos exist');
        	res.redirect('/message');
        }
        else
        {  
          	videos.find({ 
          		$where: function () { 
          			return Date.now() - this._id.getTimestamp() < (7 * 24 * 60 * 60 * 1000)  
          		}  
          	}).sort({ 
          		views: -1
          	}).limit(10).exec( function(err,vides){
               	if (err){
                    req.flash('error',err);
                }
              	else if(vids.length == 0) {
                 	//console.log(vides);
                 	req.flash('error', 'sorry required video does not exist.');
                }
              	else{
                    //console.log(vides);
    	            if(req.user)
    	               res.render('users/index',{videos:vids, videoss:vides, userdata: req.user});
    	            else
    		          res.render('index', {videos: vids, videoss:vides});
                }
            });
        }
	});
});

//password forget and reset
router.get('/forgot',function(req, res, next){
	res.render('users/forgot');
});

router.get('/settings', function( req, res, next){
	//console.log(req.user.nick+' user -------------------');
	//console.log('---------------');
	//console.log(req.user);
	res.render('users/settings', { error : req.flash('error'), success: req.flash('success'), userdata: req.user});
});

router.get('/profile', function( req, res, next){
	//console.log(req.user.nick+'.jpg');
	if(fs.existsSync(path.normalize(__dirname+"/../public/uploads/"+req.user.nick+".jpg"))){
		var str = req.user.nick+".jpg";
	   res.render('users/profile', { error : req.flash('error'), success: req.flash('success'), userdata: req.user , st:str});
	}
	else{
		var str = "circle.jpg";
	 	res.render('users/profile', { error : req.flash('error'), success: req.flash('success'), userdata: req.user , st: str });
	}
});

router.post('/profile',function(req, res, next) {
	upload(req, res, function (err) {
		var file = false;
	    if (err) {
	      	console.log(err.message);
	      	//console.log('+++++++++++');
	      	req.flash('error',err.message.toString());
	      	res.render('users/profile',{userdata: req.user ,st:req.user.nick+".jpg"});
	    }
	    else if(fileFilter==true){
	    	//console.log('++++---');
	    	fileFilter = false;
	    	req.flash('error','Error Uploading Document. Invalid File-Type.');
	      	res.render('users/profile',{userdata: req.user,st:req.user.nick+".jpg"});
	    }else if(fileUpload==true && req.files.attach==null){
	    	//console.log('++++****');
	    	fileUpload = false;
	    	req.flash('error','Error Uploading Document. Max File-Size Exceeded.');
	      	res.render('users/profile',{userdata: req.user,st:req.user.nick+".jpg"});
	      }
	    else if(req.body.message == '' && req.files.attach==null){
	    	//console.log('++++/////');
	    	req.flash('error','Please Enter a Message.');
	      	res.render('users/profile',{userdata: req.user,st:req.user.nick+".jpg"});
	      }
	    else{
			//console.log(req.body);
			//console.log(req.files);
			//console.log('++');
			var message = req.body.message;
			var originalname,name;
			if (req.files.attach!=null) {
				file = true;
				name = req.files.attach[0].filename;
				originalname = req.files.attach[0].originalname;
			} else {
				originalname=null;
				name=null;
			}
			users.update({_id: req.user},{
			  	$push: {
	        	"profile": {
	        		text: message,
        			timestamp: Date.now() ,
        			_file : file ,
	        		file : name,
	        		orignalfile : originalname
	        	}
	        }
			});
			res.render('users/profile',{userdata: req.user,st:req.user.nick+".jpg"});
		}
	});
});

//update password to synchronise with dchub
router.post('/passupdate', function(req, res, next) {
	var username = req.user.nick;
	var password = req.body.password;
	users.findOne( { 
		'nick' : username
	},function(err, user) {
		console.log(moment());
        if (err) {
        	req.flash('error',err);
        	res.redirect('settings');
        }
        else if(!user) {
        	req.flash('error', 'sorry you have not registered.');
        	res.redirect('settings');
        }
        else {
        	var url="http://172.16.86.222:13000/login?nick="+username+"&password="+password+"&secret=qwerty";
			request.get(url,function(err, httpres, body){
				body = JSON.parse(body);
				//console.log(body);
				if(err){
					console.log(err);
					req.flash('error', 'some internal error has occured');
        			res.redirect('settings');
				}
				else{
					if(body.error && body.error.length>0){
						req.flash('error', 'Incorrect Password. Please try again.' );
        				res.redirect('settings');
						//res.render('signin',{message : body.error});
					}	
					else{
						users.update( {
							'nick': username
						},{
							$set: {
								'password': createHash(password)
							} 
						},function(err, doc){
							if(err){
								console.log(err);
								req.flash('error', 'update failure due to some internal error' );
        						res.redirect('settings');
							}
							else{
								req.flash('success', 'updation successful' );
        						res.redirect('settings');
							}
						});
					}
				}
			});
        }
	});
});

router.post('/editprofile', function(req, res, next) {
	var username = req.user.nick;
	var fullname = req.user.full_name;
	var ip = req.user.ip;
	if(req.body.fullname.length>0)
		fullname = req.body.fullname;
	if(req.body.ip)
		ip = req.body.ip;
	users.update( {
		'nick': username
	},{
		$set: {
			'full_name': fullname, 
			'ip': ip,
			'issharer': true
		} 
	},function(err, doc){
		if(err){
			console.log(err);
			req.flash('error', 'update failure due to some internal error' );
			res.redirect('settings');
		}
		else{
			req.flash('success', 'updation successful' );
			res.redirect('settings');
		}
	});
});

router.post('/stopsharing', function(req, res, next) {
	var username = req.user.nick;
	/*var fullname = req.user.full_name;
	var ip = req.user.ip;
	if(req.body.fullname.length>0)
		fullname = req.body.fullname;
	if(req.body.ip)
		ip = req.body.ip;*/
	users.update( {
		'nick': username
	},{
		$set: {
			'issharer': false
		} 
	},function(err, doc){
		if(err){
			console.log(err);
			req.flash('error', 'update failure due to some internal error' );
			res.redirect('settings');
		}
		else{
			req.flash('success', 'updation successful' );
			res.redirect('settings');
		}
	});
});

/*router.post('/search',function(req,res){
	//console.log("++++++++++++++++++");
	//console.log(req.body);
	var title =req.body.title;
	videos.find( 
		            {$or:[
		                  {'users.title': new RegExp(title,"i")},
		                  {'users.description': new RegExp(title,"i")}
		                 ]
		       }).populate('users._userid').exec( function(err,vids){
		    if (err){
		    	//console.log("1");
            	req.flash('error',err);
            	res.redirect('settings');
            }
            else if(vids.length == 0) {
            	//console.log("2");
            	//console.log(vids);
            	req.flash('error', 'sorry required video does not exist.');
            	res.redirect('settings');
            }
            else
            {
            	//console.log("3");
            	//console.log(vids[0].users);
            	if(req.user)
            		res.render('users/search',{videos: vids , userdata: req.user});
            	else
            		res.render('search', {videos: vids});
            }

	});
//res.send("success");
});

router.post('/delvid', function(req, res, next) {
	var ip = req.user.ip;
	var port = 8887+random(0,1);
	var url="http://"+ip+":"+port.toString()+"/dellist.html";
	//console.log(url);
	request.get(url, function(err, httpres, body){
		var array = body.split('"""');
		var data = array[1].split('$$$');
		if(err){
			console.log(err);
			req.flash('error', 'some internal error in refreshing file');
			res.redirect('settings');
		}
		else{
			for (i=0; i< (data.length-1); i++){
				updateeach(data[i], req.user, array, req, res);
			}
			req.flash('success', 'successfully refreshed the file');
			res.redirect('settings');
		}
	});

});*/

router.post('/refresh', function(req, res, next) {
	var ip = req.user.ip;
	var port = 8887+random(0,1);
	var url="http://"+ip+":"+port.toString()+"/mylist.html";
	//console.log(url);
	request.get(url, function(err, httpres, body){
		var array = body.split('"""');
		var data = array[1].split('$$$');
		if(err){
			console.log(err);
			req.flash('error', 'some internal error in refreshing file');
			res.redirect('settings');
		}
		else{
			for (i=0; i< (data.length-1); i++){
				updateeach(data[i], req.user, array, req, res);
			}
			req.flash('success', 'successfully refreshed the file');
			res.redirect('settings');
		}
	});
});

/*router.post('/addvid', function(req, res, next) {
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
			var port = 8887+random(0,1);
			var url="http://"+ip+":"+port.toString()+"/addlist.html";
			//console.log(url);
			request.get(url, function(err, httpres, body){
				var array = body.split('"""');
				var data = array[1].split('$$$');
				if(err){
					console.log(err);
					res.send('error in updation');
				}
				else{
					for (i=0; i< (data.length-1); i++){
						updateeach(data[i], req.user, array, req, res);
					}
					res.send('successfully updated');
				}
			});
	    }
	  });
});*/


var updateeach = function(data, user,array, req, res){
	var elem=data.split(',,,,');
	//console.log(elem[0]);
	//console.log(elem[1]);
	var userid = user._id;
	videos.findOne({'tth': elem[1]}).populate('users._userid').exec( function(err, video){
		console.log(video);
		console.log(elem[1]);
		console.log('+++++++++++');
		if(err){
			console.log(err);
			req.flash('error', 'some internal error in refreshing file');
			res.redirect('settings');
		}
		else if(!video){
			console.log("$$$$$$$$$$$$$$$$$");
			var video = new videos({
				tth: elem[1],
				format: elem[0].split('.')[1],
				users: [{
					_userid: userid,
					title: elem[0].split('.')[0],
					url: '/vidserve/'+elem[0],
					version: parseInt(array[0])
				}]
			}) ;
			video.save(function(err, video){
				if(err){
					console.log(err);
					req.flash('error', 'some internal error in adding new video '+ elem[1]);
					res.redirect('settings');
				}
				console.log('updated'+ elem[0]);
			});
		}
		else{
			var flag=1;
			console.log('6666666666');
			for(var j=0; j<video.users.length; j++){
				if (JSON.stringify(video.users[j]._userid._id)== JSON.stringify(userid) ) {
					
					flag=0;   
	                videos.update({"_id": video._id, "users._userid": userid}, 
					{$set: {"users.$.title": elem[0].split('.')[0],
					"users.$.version": parseInt(array[0]),
					"users.$.url": "/vidserve/"+elem[0]	
				}}).exec();
	            	req.flash('success', 'successful');
	            }
			}
			if(flag == 1){
			    videos.update(
				{'_id' : video._id},{
		            $push:{ 
		                'users': {
		                    _userid: userid,
							title: elem[0].split('.')[0],
							url: '/vidserve/'+elem[0],
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
		//console.log('------------');
	});
}

function userValidate(req,res,next){
	//console.log(req.user);
	users.findOne(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user;
			next();
		}
		else {
      		res.redirect('/');
		}
	});
}

var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function random (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

module.exports = router;
