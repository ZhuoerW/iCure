const express = require('express');
const session = require('express-session');
const path = require('path');
const sanitize = require('mongo-sanitize');
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
const passwordHash = require('password-hash');

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
    res.render('login', {layout: false});
});

app.get("/loginCheck", function(req,res){
	if (req.query.usertype=="Doctor") {
		Doctor.findOne({email:req.query.Email, password: req.query.Password}, function(error, data){
			if (data) {
				req.session.user = data.email;
				req.session.slug = data.slug;
				res.redirect("/");
			}
			else {
				const errormessage="Sorry! Incorrect username or password. Please try again.";
				res.render("login", {"error": errormessage, layout: false});
			}
		});
}  else {
		Patient.findOne({email:req.query.Email, password: req.query.Password}, function(error, data){
			if (data) {
				req.session.user = data.email;
				req.session.slug = data.slug;
				res.redirect("/");
			}
			else {
				const errormessage="Sorry! Incorrect username or password. Please try again.";
				res.render("login", {"error": errormessage, layout: false});
			}
		});
	}
});


app.get('/registerDoctor', function(req, res){
	res.render("registerDoctor",{layout: false});
});


app.get('/registerPatient', function(req, res){
	res.render("registerPatient",{layout: false});
});


app.post('/registerPatient', function(req, res){
		new Patient({
		name: sanitize(req.body.Name),
		password: sanitize(req.body.Password),
		gender: sanitize(req.body.Gender),
		id: "0000000001",
		date_of_birth: sanitize(req.body.DateOfBirth),
		phone: sanitize(req.body.Phone),
		address: sanitize(req.body.Address),
		email: sanitize(req.body.Email),
	}).save(function(error){
		if (error) {
			console.log(error);
			const errormessage = "Invalid register information!";
			res.render('registerPatient', {"error": errormessage, layout: false});
		} else {
			res.redirect('/');
		}
	});
});

app.post('/registerDoctor', function(req, res){
		new Doctor({
		name: sanitize(req.body.Name),
		password: sanitize(req.body.Password),
		gender: sanitize(req.body.Gender),
		id: "0000000002",
		date_of_birth: sanitize(req.body.DateOfBirth),
		phone: sanitize(req.body.Phone),
		address: sanitize(req.body.Address),
		email: sanitize(req.body.Email),
		resume: sanitize(req.body.Resume),
		department: sanitize(req.body.Department),
		hospital: sanitize(req.body.Hospital),
		position: sanitize(req.body.Position),
		rating: 0
	}).save(function(error){
		if (error) {
			console.log(error);
			const errormessage = "Invalid register information!";
			res.render('registerDoctor', {"error": errormessage, layout: false});
		} else {
			res.redirect('/');
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
			let filteredDoctors = doctors.filter(function(doctorObj) {
				return doctorObj[filter] === option;
			});
			filteredDoctors.sort((a, b) => (a.rating < b.rating) ? 1:-1);
			res.render('SearchResults', {doctors: filteredDoctors});
		}
	});
});

app.get('/doctors/:slug', (req, res) => {
	const slug = sanitize(req.params.slug);
	Doctor.findOne({slug: slug}, function(err, doctor) {
		if (err || doctor === null) {
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


