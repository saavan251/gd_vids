
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');
var flash = require('connect-flash');


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


module.exports = router;
