//connecting to Database
var User = require('./app/models/user');
//Initial Step is to call all the packages required
var express = require('express');
var app= express(); //Defining application using express
var bodyParser = require('body-parser'); //get body parser
var mongoose = require('mongoose');
var morgan = require('morgan');
var bcrypt = require('bcrypt-nodejs');
var port = process.env.PORT || 8080; //setting the port for our app
var jwt = require('jsonwebtoken'); //requiring jwt token
var superSecret = 'ilovescotch'; //creating a secret string to compare with
var path = require('path');

var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "25f2f254",
  application_key: "2ccfd981db69522c822a59a57eb5e0f7"
});

//using body parser to grab information from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//setting public folder
app.use(express.static(__dirname+'/'));

//Setup one route to index.html file
 app.get('/symptom',function(req,res){
 	res.sendFile(path.join(__dirname+'/views/index.html'))
 	//next();
 })


//configure our app to handle CORS requests
app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
	next();
});

//log all requests to console
app.use(morgan('dev'));

//Routes for our api //basic route to homepage
app.get('/',function(req,res){
	res.send('Welcome to the home page !');
});

//instance of express router
var apiRouter = express.Router();

//route for authenticating users
apiRouter.post('/authenticate',function(req,res){
	//find the user and select the username and password explicity
	User.findOne({
		username:req.body.username
	}).select('name username password').exec(function(err,user){
		if (err) throw err;
		//no user with that username is found
		if(!user){
			res.json({
				success:false,
				message:'Authentication Failed. User not found.'
			});
		}else if(user){
			//check if password matches
			var validPassword = user.comparePassword(req.body.password);
			if(!validPassword){
				res.json({
					success:false,
					message:'Authentication Failed. Wrong Password.'
				});
			}else {
				//if user is found and correct password, create a token
				var token = jwt.sign({
					name: user.name,
					username:user.username,
				}, superSecret ,{
					expiresInMinutes:1440 //expires in 24 housr
				});

				//Return this infomratuon including token as json
				res.json({
					success:true,
					message:'Here is your token',
					token:token
				});
			}
		}
	});
});

//Middleware logging route to console
//routing middleware to verify token

apiRouter.use(function(req,res,next){
	console.log('Somebody is using this api!');
	//checking header or url parameters or post parameters for finding token
	//var token= req.body.token || req.param('token') || req.headers['x-access-token'];
	//above req.param is deprecated so using req.params
	var token = req.body.token || req.params.token || req.headers['x-access-token'];
	//decode token if founc
	if(token){
		//verfify with secret 
		jwt.verify(token,superSecret,function(err,decoded){
			if(err){
				return res.status(403).send({
					success:false,
					message:'Failed to authenticate token'
				});
			} else {
				//if everything is good save the request to use in ohter routs
				req.decoded=decoded;
				next();
			}
		});
	} else {
		//if there is no token
		return res.status(403).send({
			success:false,
			message: 'No token provided.'
		});
	}
	//next(); next is already called above when token is verified so no need here
});

//accessed at GET http://localhost:8080/api

apiRouter.get('/', function(req,res){
	res.json({message:'This is the GET method of API'});
});

//adding route to get information who logged in based on token
apiRouter.get('/me',function(req,res){
	res.send(req.decoded);
});


//Adding start of ajax call auto text

apiRouter.route('/search')

.get(function(req,res){
	User.find(function(err,users){
	if(err) res.send(err);
	// var data=[];
	// console.log(users);
	// for(i in users.name){
	// 	data.push(i);
	// }
	// console.log(data);
	res.json(users);
});
});



//End of ajax call auto text




//Adding more routes below
apiRouter.route('/users')
	.post(function(req,res){
	//creating a new instance of the User Model
	var user = new User();
	//setting values
	user.name=req.body.name;
	user.username=req.body.username;
	user.password=req.body.password;
	//save the user and check for errors
	/*

	user.save(myfunc);
	*/
    	user.save(function(err){
	 if(err) {
	if(err.code==11000)
		return res.json({success:false,message:'An user with that username already exists'});
	else
	       return res.send(err);
	}
	 res.json({message:'User Created'});
});
})


.get(function(req,res){
	console.log(req);
	User.find(function(err,users){
	if(err) res.send(err);
		res.json(users);
	//console.log(res);
});
});
	
//Adding another route ending in /users/:userid
apiRouter.route('/users/:user_id')
//get the user with that ID
//accessed at http://localhost:8080/api/users/:userid
	.get(function(req,res) {
		User.findById(req.params.user_id,function(err,user){
			if(err) res.send(err);
			//returing that user only
			res.json(user);
		});
	})

//Update user with the id
	.put(function(req,res){

		User.findById(req.params.user_id, function(err,user){
			if(err) res.send(err);
			//Update the user info only if its new
			if(req.body.name) user.name=req.body.name;
			if(req.body.username) username = req.body.usermame;
			if(req.body.password) password = req.body.password;

		//save the user
			user.save(function(err){
				if(err) res.send(err);
				//return message
				res.json({message:'User Update Successful!'});
			});
		});
	})	

	//Deleting User with this id
	.delete(function(req,res){
		User.remove({
			_id: req.params.user_id
		}, function(err,user){
			if(err) res.send(err);
			//Response Message
			res.json({message:'Deletion Successful'});
		
		});
	});


function responseCheck(error, response) {
  	if (error === null) {
  		

  		textapi.entities({
  	'text': response.text
	}, function(err,resdata){


   
  		console.log("In response block method2")
    	console.log(resdata);
    	//res.json(response);

	});

  		console.log('functruion response',response);
  		console.log("In response block method")
    	console.log(response);
        //res.json(response);
    }
  };
   

apiRouter.route('/textapi')
	.post(function(req,res){
	console.log('Kovid Testing');
	console.log(req.body);
	console.log(req.body.data);
	//console.log(req.params);
	//Unable to get the req.body.data from code level
	var text=req.body.data;
	console.log('Dev Testing API Results');
	//console.log(text);
	textapi.entities({
  	'text': text
	}, function(error,response){

    if (error === null) {
  		

  		textapi.entities({
  	'text': response.text
	}, function(err,resdata){
  		console.log("In response block method2")
    	console.log(resdata);
    	res.json(resdata);
	});

  	
    }

	});

	

})
app.use('/api',apiRouter);

//Start the server
app.listen(port);
console.log('Listening on Port number' +port);

