
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

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.use(function(req, res, next) {
	if(!req.user) {
		res.render('signin',{error : req.flash('error'), success: req.flash('success')});
	}
	else
  		next();
});

router.get('/signin', function(req, res, next) {
	if(!req.user){
		//req.flash('error','Please Sign in');
		res.render('signin',{error : req.flash('error'), success: req.flash('success')});
	}
    else{
    	res.redirect('/users/index');
    	//res.render('users/index',{ username: req.user.nick});
    }
});

router.get('/index',function(req,res,next){
	console.log(req.session);
	console.log(req.user," req.user");
	res.render('users/index',{ username: req.user.nick});
});

//password forget and reset
router.get('/forgot',function(req, res, next){
	res.render('users/forgot');
});

router.get('/settings', function( req, res, next){
	//console.log(req.user.nick+' user -------------------');
	res.render('users/settings');
});

//update password to synchronise with dchub
router.post('/passupdate', function(req, res, next) {
	//console.log(req);
	//res.send(req.body);
	//console.log(req.body);
	//console.log("---------------")
	var username = req.user.nick;
	var password = req.body.password;
	users.findOne( { 'nick' : username},function(err, user) {
		console.log(moment());
            if (err) {
            	req.flash('error',err);
            	res.render('success',{error : req.flash('error'), success: req.flash('success')})

            }
            else if(!user) {
            	req.flash('error', 'sorry you have not registered.');
            	res.render('success',{error : req.flash('error'), success: req.flash('success')})
            }
            else {
            	var url="http://172.16.86.222:13000/login?nick="+username+"&password="+password+"&secret=qwerty";
				request.get(url,function(err, httpres, body){
					body = JSON.parse(body);
					//console.log(body);
					if(err){
						console.log(err);
						req.flash('error', 'some internal error has occured');
            			res.render('success',{error : req.flash('error'), success: req.flash('success')})
					}
					else{
						if(body.error && body.error.length>0){
							req.flash('error', 'Incorrect Password. Please try again.' );
            				res.render('success',{error : req.flash('error'), success: req.flash('success')})
						//res.render('signin',{message : body.error});
						}	
						else{
							users.update( {'nick': username},{
								$set: {'password': createHash(password)} },function(err, doc){
								if(err){
									console.log(err);
									req.flash('error', 'update failure due to some internal error' );
            						res.render('success',{error : req.flash('error'), success: req.flash('success')})
								}
								else{
									req.flash('success', 'updation successful' );
            						res.render('success',{error : req.flash('error'), success: req.flash('success')})
								}
							});
						}

					}
				});
            }

	});

});

router.post('/editprofile', function(req, res) {
	var username = req.user.nick;
	var fullname = req.user.full_name;
	var ip = req.user.ip;
	if(req.body.fullname.length>0)
		fullname = req.body.fullname;
	if(req.body.ip)
		ip = req.body.ip;
	users.update( {'nick': username},{
		$set: {'full_name': fullname, 'ip': ip} },function(err, doc){
		if(err){
			console.log(err);
			req.flash('error', 'update failure due to some internal error' );
			res.render('success',{error : req.flash('error'), success: req.flash('success')})
		}
		else{
			req.flash('success', 'updation successful' );
			res.render('success',{error : req.flash('error'), success: req.flash('success')})
		}
	});
});


var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

module.exports = router;
