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
  // var v1 = null;
   videos.aggregate([
   	     {$sort: {_id: -1}},
   	     {$limit: 5}
   	]).exec( function(err,vids){
		    if (err){
		    	//console.log("1");
            	req.flash('error',err);
            }
            else if(vids.length == 0) {
            	//console.log("2");
            	console.log(vids);
            	req.flash('error', 'sorry required video does not exist.');
            	//res.redirect('settings');
            }
            else
            {  
              videos.find({ $where: function () { return Date.now() - this._id.getTimestamp() < (7 * 24 * 60 * 60 * 1000)  }  }
                ).sort({ views: -1}).limit(5).exec( function(err,vides){
                   if (err){
                             req.flash('error',err);
                           }
                  else if(vids.length == 0) {
                     console.log(vides);
                     req.flash('error', 'sorry required video does not exist.');
                       }
                  else{
                         console.log(vides);
        	             if(req.user)
        	               	res.render('users/index',{videos:vids, videoss:vides, userdata: req.user});
        	             else
        		          res.render('index', {videos: vids, videoss:vides});
                    }
                });
            }

	});
	
});

router.post('/attendance', function(req, res, next) {
  //console.log(req);
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
      users.update( {'nick': username},{
        $set: {'lastseen': Date.now()} },function(err, doc){
          if(err){
            console.log(err);
            res.send('last seen error');
          }
          else{
            res.send('success');
          }
        });
    }
  });
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

router.get('/search',function(req,res){
	console.log("++++++++++++++++++");
  console.log(req.url);
	console.log(req.query);
  var title =req.query.title;
  videos.find({ $or: 
    [ {'users.title': new RegExp(title,"i")},
      {'users.description': new RegExp(title,"i")}
    ]
    }).exec( function(err,videoss){
      if(err){
        console.log("1aaaaaaaaa");
        req.flash('error',err);
        res.redirect('settings');
      }
      else if(videoss.length == 0){
        console.log("2aaaaaaa");
        console.log(videoss);
        req.flash('error', 'sorry required video does not exist.');
        res.redirect('');
      }
      else{
          var a = [];var limiting =10;
          var plength = videoss.length;
          for (var i = 0; i < plength/limiting; i++) {
            a.push(i);
          }
            console.log(a);
            console.log('ggggg');
          if(!req.query.page){
            page=0;
          }
          else
            page= req.query.page;
          console.log(page);
          var skipping = page*limiting;
          videos.find( 
                        {$or:[
                              {'users.title': new RegExp(title,"i")},
                              {'users.description': new RegExp(title,"i")}
                             ]
                   }).skip(skipping).limit(limiting).populate('users._userid').exec( function(err,vids){
                if (err){
                  console.log("1aaaaaaaaa");
                      req.flash('error',err);
                      res.redirect('settings');
                    }
                    else
                    {
                      console.log("3aaaaaaaaaa");
                      console.log(vids[vids.length-1].users);
                      if(req.user)
                        res.render('users/search',{userdata: req.user, a:a, videos:vids, qry: req.query});
                      else
                        res.render('search', {userdata: req.user, a:a, videos: vids, qry: req.query});
                    }
                  });

              }
            });
	});

router.get('/latest', function(req, res) {
  var a = [];
  var limiting =10;
  var plength = 40;
  for (var i = 0; i < plength/limiting; i++) {
    a.push(i);
  }
  console.log(a);
  console.log('ggggg');
  if(!req.query.page){
    page=0;
  }
  else
    page= req.query.page;
  console.log(page);
  var skipping = page*limiting;
  videos.find({}).populate('users._userid').skip(skipping).limit(limiting).sort({'_id': -1}).exec( function(err,vids){
    if (err){
      console.log("1aaaaaaaaa");
      req.flash('error',err);
      res.redirect('settings');
    }
    else{
      console.log("3aaaaaaaaaa");
      console.log(vids[0].users);
      if(req.user)
        res.render('users/latest',{userdata: req.user, a:a, videos:vids, qry: req.query});
      else
        res.render('latest', {userdata: req.user, a:a, videos: vids, qry: req.query});
   }
  });
});

router.get('/about', function(req, res) {
  res.render('error');

});

router.get('/sharers', function(req, res) {
  res.render('error');

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

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}
module.exports = router;
