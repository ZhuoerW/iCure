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
		id: '0000000001',
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
	console.log(req.session.user);
	if (req.session.user===undefined) {
		res.render('HomePage',{NotLogin: true});
	}
	else {
		res.render('HomePage');
	}
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

// Forum
app.get('/main-forum', (req, res) => {
	Post.find(function(err, posts) {
		if (req.query.option === "") {
			res.render('forumPosts', {posts: posts});
		} else {
			const option = sanitize(req.query.option);
			const filter = sanitize(req.query.filter);
			const filteredPosts = posts.filter(function(postObj) {
				return postObj[filter] === option;
			});
			res.render('forumPosts', {posts: filteredPosts});
		}
	});
});

app.get('/posts-new', (req, res) => {
	res.render('addPost');
});

app.post('/posts-new', (req, res) => {
	const title = sanitize(req.body.title);
	const content = sanitize(req.body.content);
	const myDate = new Date();
	const time = myDate.getTime();
	const stringTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
	const newPost = new Post({
		title: title,
		content: content,
		author_id: req.user._id,
		create_time: stringTime,
		comments: [],
		name: req.user.name,
		hit: 0
	});
	newPost.save(function(err) {
		if (err) {
			res.render('addPost', {error: true});
		} else {
			res.redirect('/main-forum');
		}
	});
});

app.get('/posts/:slug',(req, res) => {
	/*
	if (req.session.user === undefined) {
		res.redirect('/login');
	}
	*/
	const slug = sanitize(req.params.slug);
	const name = sanitize(req.query.option);
	Post.findOne({slug: slug}, function(err, post) {
		if (err || topic === null) {
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
	/*
	if (req.session.user === undefined) {
		res.redirect('/login');
	}
	*/
	const slug = sanitize(req.params.slug);
	const comment = sanitize(req.body.comment);
	const name = req.user.name;
	const author_id = req.user._id;
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
					res.redirect('/posts/' + slug);
				}
			});
		}
	});
});


app.get('/logout', (req,res) => {
	req.session.user=undefined;
	req.session.slug = undefined;
	res.redirect('/HomePage');
});

app.listen(3000);


