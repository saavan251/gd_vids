
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

//password forget and reset
router.get('/forgot',function(req, res, next){
	res.render('users/forgot');
});

//update password to synchronise with dchub
router.post('/passupdate', function(req, res, next) {
	//console.log(req);
	//res.send(req.body);
	var username = req.body.username;
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

router.get('/index',function(req,res,next){
	if(!req.user) {
		res.redirect('/users/signin');
	}
	else {
		console.log(req.session);
		console.log(req.user," req.user");
	res.render('users/index',{ username: req.user.nick});
	}
})


var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

module.exports = router;
