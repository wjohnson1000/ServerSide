require('dotenv').config();
var Express = require('express')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , session = require('express-session')
  , PORT = process.env.PORT || '3000'
	, jwt = require('jsonwebtoken')
  , users = require('./routes/users')
  , auth = require('./routes/auth')
  , search = require('./routes/search')
	, db_api = require('./routes/db_api')
  , bodyParser = require('body-parser')
  , birds = require('./routes/birds')
	, birdPuns = require('bird-puns');




passport.use('twitterLogin', new TwitterStrategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  },
  function(token, tokenSecret, profile, done) {
		checkForUser(profile.id).then(function(user){
    	return done(null, user);
		}).catch(function(error) {
			console.log(error);
		});
  }
));

passport.serializeUser(function(user, done) {
 done(null, user);
});
passport.deserializeUser(function(obj, done) {
 done(null, obj);
});

function checkForUser (profile_id) {
	console.log('checking for user');
	return new Promise(function(resolve, reject) {
		db_api.findUser(profile_id)
			.success(function(user) {
				if (user.length > 0) {
					console.log('found user ' + user);
					resolve(user);
				} else {
					console.log('adding user');
					db_api.addUser(profile_id)
						.success(function(user) {
							resolve(user);
						}).error(function(error){
							reject(error);
						});
				}
			})
			.error(function(error) {
				console.log(error);
			});
	});
}

var server = Express();
server.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'big butts'
}));

server.use(passport.initialize());
server.use(passport.session());
server.use(bodyParser.json());


server.use('/users', users);
server.use('/auth', auth);
server.use('/search', search);
server.use('/', birds);

server.get('/pun', function(request, response) {
	response.send(birdPuns.getBirdPun());
});

server.listen(PORT, function(){
  console.log('listening');
});

module.exports = server;
