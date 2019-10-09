const express = require('express');
const session = require('express-session');
const path = require('path');
//const sanitize = require('mongo-sanitize');
//const moment = require('moment');

require('./db');
const mongoose = require('mongoose');
const Visitor = mongoose.model('Visitor');
const Patient = mongoose.model('Patient');
const Doctor = mongoose.model('Doctor');
const Appointment = mongoose.model('Appointment');
const Message = mongoose.model('Message');
const Chat = mongoose.model('Chat');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const MedicalProfile = mongoose.model('MedicalProfile');

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

app.get("/login", function(req, res) {

    res.render('home', {layout: false});
});

app.get("/loginCheck", function(req,res){
		User.findOne({username:req.query.username}, function(error, data){
			if (error||!data||!passwordHash.verify(req.query.password,data.password)){
				const errormessage="Sorry! Incorrect username or password. Please try again.";
				res.render("hindex", {"error": errormessage});
			}
			else {
				req.session.user = data.username;
				req.session.slug = data.slug;
				res.redirect("/HomePage/"+data.slug);
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
			res.redirect('/HomePage');
		}
	});
});

app.get('/', (req, res) => {
	res.render('HomePage');
});

app.get('/search-result', (req, res) => {
	Doctor.find(function(err, doctors) {
		console.log(doctors);
		if (req.query.option === "") {
			res.render('SearchResults', {doctors: doctors});
		} else {
			const option = sanitize(req.query.option);
			const filter = sanitize(req.query.filter);
			const filteredDoctors = doctors.filter(function(doctorObj) {
				return doctorObj[filter] === option;
			});
			res.render('SearchResults', {doctors: filteredDoctors});
		}
	});
});

app.get('/doctors/:slug', (req, res) => {
	const slug = sanitize(req.params.slug);
	Doctor.findOne({slug: slug}, function(err, doctor) {
		if (err || topic === null) {
			res.render('DoctorDetail', {error: true});
		} else {
			res.render('DoctorDetail', {doctor: doctor});

		}
	});
});


app.get('/logout', (req,res) => {
	req.session.user=null;
	req.session.slug = null;
	res.redirect('/HomePage');
});

app.listen(3000);


