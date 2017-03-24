var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');

var users = mongoose.model('users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Gamedrone' });
});

router.post('/userslogin', passport.authenticate('userlogin', {
    successRedirect: '/users/index',
    failureRedirect: '/users/signin'
}));

/*router.post('/userslogin', passport.authenticate('userlogin',{
	failureRedirect: '/users/signin'}),function(req,res){
	console.log(req.user);
	res.redirect('/users/index');
});*/

router.get('/logout', function(req, res) {
	req.logout();
	req.session.destroy();
	res.redirect('/');
})

var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
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


module.exports = router;
