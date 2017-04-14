var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');

var users = mongoose.model('users');
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var videos = mongoose.model('videos');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('videos');
});
router.post('/upload', upload.any(),function(req, res, next) {
  res.send(req.files);
});

router.post('/userslogin', passport.authenticate('userlogin', {
    successRedirect: '/users/index',
    failureRedirect: '/users/signin',
    failureFlash: true
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
});

router.post('/search',function(req,res){
	console.log("++++++++++++++++++");
	console.log(req.body);
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
            	console.log(vids);
            	req.flash('error', 'sorry required video does not exist.');
            	res.redirect('settings');
            }
            else
            {
            	//console.log("3");
            	console.log(vids[0].users);
            	if(req.user)
            		res.render('users/search',{videos:vids});
            	else
            		res.render('search', {videos: vids});
            }

	});
//res.send("success");
});

router.get('/success', function(req, res) {
	res.render('success', {error : req.flash('error'), success: req.flash('success')});
});

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
