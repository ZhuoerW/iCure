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


app.listen(3000);