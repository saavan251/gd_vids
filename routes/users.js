
var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var fs = require('fs');


//models
var users = mongoose.model('users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/signin', function(req, res, next) {
  res.render('signin',{message : ""});
});

router.get('/index',function(req,res,next){
	//console.log(req.query.token);
	res.render('users/index');
})


module.exports = router;
