const express = require('express');
const session = require('express-session');
const path = require('path');
const sanitize = require('mongo-sanitize');
const moment = require('moment');

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
const Id = mongoose.model('Id');
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

app.use(function(req, res, next){
	res.locals.user = req.session.name;
	res.locals._id = req.session._id;
	res.locals.userslug = req.session.slug;
  next();
});

app.get("/login", function(req, res) {
    res.render('login', {layout: false});
});

app.get("/signup", function(req, res) {
    res.render('signup', {layout: false});
});

app.get("/loginCheck", function(req,res){
	if (req.query.usertype=="Doctor") {
		Doctor.findOne({email:req.query.Email, password: req.query.Password}, function(error, data){
			if (data) {
				req.session.name = data.name;
				req.session._id = data.id;
				req.session.slug = data.slug;
				res.redirect("/");
			}
			else {
				const errormessage="Sorry! Incorrect username or password. Please try again.";
				res.render("login", {"error": errormessage, layout: false});
			}
		});
}  else if (req.query.usertype=="Patient"){
		Patient.findOne({email:req.query.Email, password: req.query.Password}, function(error, data){
			if (data) {
				req.session.name = data.name;
				req.session._id = data.id;
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
	Id.findOne({type:'init'},function(error, data){
		if (data) {
			let id = data.id;
		new Patient({
		name: sanitize(req.body.Name),
		password: sanitize(req.body.Password),
		gender: sanitize(req.body.Gender),
		id: id.toString(),
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
			let NewId = id+1;
			Id.findOneAndUpdate({type:'init'},{id:NewId},function(error,data){
				if (error) {
					console.log(error);
				} else {
					res.redirect('/');
				}
			});
		}
	});
		} 
	});
});

app.post('/registerDoctor', function(req, res){
	Id.findOne({type:'init'},function(error, data){
		if (data) {
			let id = data.id;
		new Doctor({
		name: sanitize(req.body.Name),
		password: sanitize(req.body.Password),
		gender: sanitize(req.body.Gender),
		id: id.toString(),
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
			let NewId = id+1;
			Id.findOneAndUpdate({type:'init'},{id:NewId},function(error,data){
				if (error) {
					console.log(error);
				} else {
					res.redirect('/');
				}
			});
		}
	});
		} 
	});
	});

app.get('/', (req, res) => {
	console.log(req.session.name);
	if (req.session.name===undefined) {
		res.render('HomePage',{NotLogin: true});
	}
	else {
		console.log("herer");
		res.render('HomePage');
	}
});

app.get('/search-result', (req, res) => {
	Doctor.find(function(err, doctors) {
		console.log(doctors);
		if (req.query.option === "") {
			doctors.sort((a, b) => (a.rating < b.rating) ? 1:-1);
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

// Forum
app.get('/main-forum', (req, res) => {
	Post.find(function(err, posts) {
		if (req.query.option === "") {
			posts.sort((a, b) => (a.hit < b.hit) ? 1:-1);
			posts.map(function(postObj) {
				postObj.content = postObj.content.slice(0, 320);
				return postObj;
			});
			res.render('forumPosts', {posts: posts});
		} else {
			const option = sanitize(req.query.option);
			const filter = sanitize(req.query.filter);
			const filteredPosts = posts.filter(function(postObj) {
				return postObj[filter] === option;
			}).map(function(postObj) {
				postObj.content = postObj.content.slice(0, 300);
				return postObj;
			});
			filteredPosts.sort((a, b) => (a.hit < b.hit) ? 1:-1);
			res.render('forumPosts', {posts: filteredPosts});
		}
	});
});

app.get('/posts-new', (req, res) => {
	if (req.session.name !== undefined){
	res.render('addPost'); 
	} else {

		res.redirect('/login');
	}
});

app.post('/posts-new', (req, res) => {
	const rawContent = JSON.parse(sanitize(req.body.content));
	console.log("rawcontent",rawContent);
	const title = sanitize(req.body.title);
	const content = rawContent["ops"][0]["insert"].trim();
	const myDate = new Date();
	const time = myDate.getTime();
	const stringTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
	const newPost = new Post({
		title: title,
		content: content,
		author_id: req.session._id,
		create_time: stringTime,
		comments: [],
		name: req.session.name,
		hit: 0
	});
	newPost.save(function(err) {
		if (err) {
			console.log(err);
			res.render('addPost', {error: true});
		} else {
			res.redirect('/main-forum');
		}
	});
});

app.get('/posts/:slug',(req, res) => {
	const slug = sanitize(req.params.slug);

	const name = sanitize(req.query.option);
	Post.findOneAndUpdate({slug: slug}, {$inc: {hit: 1}}, function(err, post) {
		if (err) {
			res.render('postContent', {error: true});
		} else {
			Comment.find({_id: post.comments}, function(err, comments) {
				if (err) {
					res.render('postContent', {error: true});
				} else if (req.query.option === "" || req.query.option === undefined) {
					res.render('postContent', {post: post, comments: comments});
				} else {
					const filteredComments = comments.filter(function(commentObj) {
						return commentObj.name === name;
					});
					res.render('postContent', {post: post, comments: filteredComments});
				}
			});
		}
	});
});

app.get('/posts/:slug/comments', (req, res) => {
	const slug = sanitize(req.params.slug);
	res.redirect('/posts/'+slug);
});

app.post('/posts/:slug/comments', (req, res) => {
	
	if (req.session.name === undefined) {
		res.redirect('/login');
	}

	const slug = sanitize(req.params.slug);
	const comment = sanitize(req.body.comment);
	const name = req.session.name;
	const author_id = req.session._id;
	const myDate = new Date();
	const time = myDate.getTime();
	const stringTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
	const newComment = new Comment({
		content: comment,
		author_id: author_id,
		create_time: stringTime,
		name: name
	});

	newComment.save(function(err, savedComment) {
		if (err) {
			console.log('error 1', err);
			res.render('postContent', {commentError: true});
		} else {
			Post.findOneAndUpdate({slug: slug}, {$push: {comments: savedComment._id}}, function(err) {
				if (err) {
					console.log('error 2',err);
					res.render('postConent', {commentError: true});
				} else {
					//res.json(savedComment);
					console.log("here 3");
					res.redirect('/posts/' + slug);
				}
			});
		}
	});
});

app.get('/make-appointment/:slug', function(req, res){
	if (req.session.name === undefined) {
		res.redirect('/login');
	}
	const doctorSlug = req.params.slug;
	Doctor.findOne({slug:doctorSlug}, function(error,doctor){
		if (error){
			console.log(error);
		}
		else {
			Appointment.find({doctor_id:doctor.id},function(error,appointment){
				if (error){
					console.log(error);
				} else {
					res.render('makeAppointment',{doctor:doctor,appointment:JSON.stringify(appointment),slug:req.session.slug});
				}
			});
		}
	});
});
app.post('/update-appointment',function(req,res){
	const event = JSON.parse(req.body.newEvent);
	let doctor_id = req.body.doctor_id.toString();
	console.log(event);
	newEvent = new Appointment({
		start: event.start,
		end:event.end,
		doctor_id: doctor_id,
		patient_id:req.session._id,
		chief_complaint:event.chief_complaint,
	});
	newEvent.save(function(err, appointment){
		if (err){
			console.log(err);
		} else {
			console.log("success");
		}
	});

});
app.get('/appointment-history/:slug',function(req,res){
	console.log("redirect HomePage");
	let upcoming = [];
	let history = [];
	Appointment.find({patient_id: req.session._id}, function(err, appointments) {
	if (err) {
		res.render('appointmentHistory', {error: true});
	} else {
		for (i=0; i<appointments.length; i++ ){
			if (appointments[i].status === "Upcoming"){
				upcoming.push(appointments[i]);
			} else {
				history(appointments[i]);
			}
		}
		res.render('appointmentHistory', {upcoming:upcoming,history:history});
	} 
});

});

app.get('/logout', (req,res) => {
	req.session.name = undefined;
	req.session._id = undefined;
	req.session.slug = undefined;
	res.redirect('/');
});

app.get('/info-form', (req, res) => {
	Post.find(function(err, posts) {
		if (req.query.option === "") {
			res.render('patientInfoForm', {posts: posts});
		} else {
			const option = sanitize(req.query.option);
			const filter = sanitize(req.query.filter);
			const filteredPosts = posts.filter(function(postObj) {
				return postObj[filter] === option;
			});
			res.render('patientInfoForm', {posts: filteredPosts});
		}
	});
});

app.listen(3000);


