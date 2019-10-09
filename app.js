const express = require('express');
const session = require('express-session');
const path = require('path');
const sanitize = require('mongo-sanitize');
const moment = require('moment');

require('./db');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'hbs');

const publicPath = path.join(__dirname);
app.use(express.static(publicPath));
app.use(express.urlencoded({extended: false}));

const sessionOptions = {
	secret: 'secret for signing session id',
	saveUninitialized: false,
	resave: false
};
app.use(session(sessionOptions));


app.get("/", function(req, res){
	res.redirect("/index");
});


app.get("/login", function(req,res){
		User.findOne({username:req.query.username}, function(error, data){
			if (error||!data||!passwordHash.verify(req.query.password,data.password)){
				const errormessage="Sorry! Incorrect username or password. Please try again.";
				res.render("hindex", {"error": errormessage});
			}
			else {
				req.session.user = data.username;
				req.session.slug = data.slug;
				res.redirect("/index/"+data.slug);
			}
		});
});


app.get('/register', function(req, res){
	res.render("register");
});

app.post('/register', function(req, res){
		new User({
		username: sanitize(req.body.username),
		password: passwordHash.generate(sanitize(req.body.password)),
		age : sanitize(req.body.age),
		sex: sanitize(req.body.sex)
	}).save(function(error){
		if (error) {
			const errormessage = "Invalid register information!";
			res.render('register', {"error": errormessage});
		} else {
			res.redirect('/index');
		}
	});
});

app.get("/logout", function(req,res){
	req.session.user=null;
	req.session.slug = null;
	res.redirect("/home");
});
app.listen(3000);