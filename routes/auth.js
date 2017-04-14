var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose');
var users = mongoose.model('users');
var express = require('express');
var request = require('request');
var bCrypt = require('bcrypt-nodejs');
var moment = require('moment');
var fs = require('fs'); 

var router = express.Router();

//models


passport.serializeUser(function(user,done){
	console.log('serializing user..'+user);
	done(null,user.nick);
});

passport.deserializeUser(function(obj,done){
	console.log('deserialising '+obj);
	users.findOne({ 'nick' :  obj },function(err, user) {
	done(err, user);
});
});


passport.use('userlogin',new LocalStrategy(
    function(username, password, done) { 
        users.findOne({ 'nick' :  username },function(err, user) {
                console.log(moment());
                if (err)
                    return done(err);
                else if (!user){
		            var url="http://172.16.86.222:13000/login?nick="+username+"&password="+password+"&secret=qwerty";
					request.get(url,function(err, httpres, body){
					body = JSON.parse(body);
					//console.log(body);
					if(err){
						console.log(err);
						return done(null, false, { message: 'some internal error has occured' });
					}
					else{
						if(body.error && body.error.length>0){
						return done(null, false, { message: 'Incorrect Password. Please try again.' });
						//res.render('signin',{message : body.error});
						}	
						else{
							var user = new users({
							full_name: body.fullname,
							nick: body.nick,
							level: body.level,
							password: createHash(password)
						}) ;
						user.save(function(err, user){
							if(err){
								console.log(err);
								return done(null, false, { message: 'Database error' });
							}
							return done(null,user);
						});
						
						//res.redirect('../users/index?token='+body.fullname);
							//res.render('users/index',{uname: body.fullname});
						}

					}
						
					});               
                }
                else if (!isValidPassword(user, password)){
                    return done(null, false, { message: 'Incorrect Password. Please try again.' });
                }
                /*if(!user._login){
                    return done(null, false, { message: 'Login Disabled for this user.Contact Admin for support.' });
                }*/
                else {
                return done(null, user);
            }
            }
        );

    })
);

/*router.post('/',function(req, res, next){
	var usr=req.body.uname;
	var psw=req.body.psw;

	users.findOne({nick: usr},function(err, user){
		if(!user){
			var url="http://172.16.86.222:13000/login?nick="+usr+"&password="+psw+"&secret=qwerty";
			request.get(url,function(err, httpres, body){
				body = JSON.parse(body);
				console.log(body);
				if(err){
					console.log(err);
					res.send("some internal error has occured");
				}
				else{
					if(body.error && body.error.length>0){
					res.render('signin',{message : body.error});
					}	
					else{
						var user = new users({
						full_name: body.fullname,
						nick: body.nick,
						level: body.level,
						password: createHash(psw)
					}) ;
					user.save(function(err, user){
						if(err){
							console.log(err);
							//res.send('database error');
						}
					});
					res.redirect('../users/index?token='+body.fullname);
						//res.render('users/index',{uname: body.fullname});
					}

				}
				
			});
		}
		else{
			res.redirect('../users/index?token='+usr);
		}
	});

});
*/
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.password);
}
module.exports = passport;
/*172.16.86.222:13000/login?nick=value&password=pass&secret=qwerty
test123
123456*/