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

router.get('/', function(req, res, next) {
	console.log(req.body);
	res.render('admin/admsignin',{error: req.flash('error'), success: req.flash('success')});
});

router.use(function(req, res, next) {
	if(req.user != null && req.user.nick == "adminhainbhai")
		next();
	else
		res.redirect('/charasadminhaiaurrahega');
});

router.get('/index', function(req, res, next) {
	//console.log('klsjdfslkaf');
	res.render('admin/index');
});

function userValidate(req,res,next){
	console.log(req.user);
	users.findOne(req.user,function(err, user) {
		if(user!=null ){
			req.session.user = user;
			next();
		}
		else {
      		res.redirect('/charasadminhaiaurrahega');
		}
	});
}

var isValidPassword = function(user, password){
	console.log(password + " 77777 " + user.password);
	return bCrypt.compareSync(password, user.password);
}

module.exports = router;

