//Loading express project to create app
var express = require('express');
var app = express();
var path = require('path');

//Sending index.html file to the user for the homepage
app.get('/',function(req,res){
		var adminRouter = express.Router();
		adminRouter.use(function(req,res,next) {
		//routing middleware requests and logging each request
		// to console before calling method
		console.log(req.method,req.url);
		//continue doing 
		next();
		});
		//admin main page http://localhost:9786/admin
		adminRouter.get('/', function(req,res) {
			res.send('I am the dashboard!');
		});
		
		//app.route using to get and post
		app.route('/login')
		.get(function(req,res) {
			res.send('this is the login form');
		})

		//process the form POST Method
		.post(function(req,res) {
			console.log('Processing');
			res.send('processing the login form!');
		});

		//http://localhost:9786/admin/users
		 adminRouter.get('/users', function(req,res) {
                        res.send('Showing all users command!');
                });	
		//posts page http://localhost:9786/admin/posts
		 adminRouter.get('/posts', function(req,res) {
                        res.send('Showing all posts response!');
                });
		// route middleware to validate :name
		adminRouter.param('name', function(req, res, next, name) {
		// do validation on name here
		// blah blah validation
		// log something so we know its working
		console.log('doing name validations on ' + name);

		// once validation is done save the new item in the req
		req.name = name;
		// go to the next thing
		next();
		 });
		//route with parameters http://localhost:9786/admin/users/:name
		adminRouter.get('/users/:name', function(req,res) {
                        res.send('hello '+ req.name + '!');
                });
		app.use('/admin',adminRouter);
		res.sendFile(path.join(__dirname + '/index.html'));
});

//Starting the server
app.listen(9786);
console.log('Visit website at http://localhost:9786');
