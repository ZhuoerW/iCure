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
	res.locals.type = req.session.type;
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
				req.session.type = "Doctor";
				req.session.name = data.name;
				req.session._id = data.id;
				req.session.slug = data.slug;
				res.redirect("/");
			}
			else {
				const errormessage="Sorry! Incorrect username or password. Please try again.";
				res.render("login", {"error": errormessage, layout: false});
			}
		});4
}  else if (req.query.usertype=="Patient"){
		Patient.findOne({email:req.query.Email, password: req.query.Password}, function(error, data){
			if (data) {
				req.session.type = "Patient";
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
	let twentyPosts;
	let selectedPosts;
	Post.find(function(err,posts){
		posts.sort((a, b) => (a.hit < b.hit) ? 1:-1);
		twentyPosts = posts.slice(0,20);
		selectedPosts = getRandom(twentyPosts, Math.min(10,twentyPosts.length))
		.map(function(postObj) {
			postObj.content = postObj.content.slice(0, 300);
			return postObj;
		});
		console.log(posts);
		if (req.session.name===undefined) {
			res.render('HomePage',{NotLogin: true,posts:selectedPosts});
		}
	else {
		res.render('HomePage',{posts:selectedPosts});
	}
		});
});


app.get('/search-result', (req, res) => {
	Doctor.find(function(err, doctors) {
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
	let doctor_id = sanitize(req.body.doctor_id).toString();
	newEvent = new Appointment({
		title: event.title,
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
	let upcoming = [];
	let history = [];
	let current_app = {};
	Appointment.find({patient_id: req.session._id}, function(err, appointments) {
	if (err) {
		res.render('appointmentHistory', {error: true});
	} else {
		for (i=0; i<appointments.length; i++ ){
			current_app = appointments[i];
			if (appointments[i].status === "Upcoming"){
				getDoctorAndPatient(current_app);
				current_app.slotEventOverlap=false;
				upcoming.push(current_app);
				} else {
						getDoctorAndPatient(current_app);
						current_app.slotEventOverlap=false;
						history.push(current_app);
				}
			}
		}
		res.render('appointmentHistory', {upcoming:upcoming,history:history});
});
});

app.get('/diagnosis/:slug',function(req,res){
	let currentAppointment = {};
	let slug = req.params.slug;
	let currDoctor;
	Appointment.findOne({slug:slug},function(err,appointment){
		if (appointment){
			currentAppointment = appointment;
			Doctor.findOne({id:appointment.doctor_id},function(err,doctor){
				currDoctor  = doctor;
				if (doctor){
					MedicalProfile.findOne({patient_id:currentAppointment.patient_id}, function(err,data){
						if (data){
							res.render("diagnosisDetail",{appointment:currentAppointment,doctor:currDoctor,medicalProfile:data,slug:slug});
						} else {
							new MedicalProfile({
								patient_id:currentAppointment.patient_id
							}).save(function(err,data){
								if (data){
									res.render("diagnosisDetail",{appointment:currentAppointment,doctor:currDoctor,medicalProfile:data,slug:slug});
								}
							});
						}
					});
				}
			});
		}
	});
});

app.post('/diagnosis/:slug',function(req,res){
	let slug = req.params.slug;
	let rawDiagnosis = JSON.parse(sanitize(req.body.diagnosis));
	let diagnosis = rawDiagnosis["ops"][0]["insert"].trim();
	let newMedical = {
		height: sanitize(req.body.height),
		weight: sanitize(req.body.weight), 
		right_eye_sight: sanitize(req.body.right_eye_sight),
		left_eye_sight: sanitize(req.body.left_eye_sight),
		blood_type: sanitize(req.body.blood_type),
		medical_history: sanitize(req.body.medical_history),
		allergy: sanitize(req.body.allergy),
		blood_pressure_low: sanitize(req.body.blood_pressure_low),
		blood_pressure_high: sanitize(req.body.blood_pressure_high),
	};
	Appointment.findOneAndUpdate({slug:slug},{diagnosis:diagnosis,status:"History"},function(err,appointment){
		if (appointment){
			MedicalProfile.findOneAndUpdate({patient_id:req.session._id},newMedical,function(err,data){
				res.redirect('/appointments/'+slug);
			});
		}
	});
});

app.post('/rate/:slug',function(req,res){
	let slug = req.params.slug;
	let rate = sanitize(req.body.rate);
	let rawComment = JSON.parse(sanitize(req.body.comment));
	let comment = rawComment["ops"][0]["insert"].trim();
	Appointment.findOneAndUpdate({slug:slug},{rate:rate,comment:comment},function(err,appointment){
		if (appointment){
				res.redirect('/rate/'+slug);
			}
		});
});

app.get('/logout', (req,res) => {
	req.session.name = undefined;
	req.session._id = undefined;
	req.session.slug = undefined;
	res.redirect('/');
});

app.get('/info-form/:slug',function(req,res){
	if (req.session.type === "Doctor"){
		Doctor.findOne({slug:req.session.slug},function(err,doctor){
			if (doctor){
				res.render("doctorInfoForm",{my:doctor});
			}
		});
	} else if(req.session.type === "Patient"){
		Patient.findOne({slug:req.session.slug},function(err,patient){
			if (patient){
				res.render("patientInfoForm",{my:patient});
			}
		});
	}
});

app.post('/update-profile/:slug',function(req,res){
	let newProfile = {}
	if (req.session.type === "Doctor"){
		newProfile = {
			phone: sanitize(req.body.phone),
			address: sanitize(req.body.address),
			email: sanitize(req.body.email),
			resume: sanitize(req.body.resume),
			hospital: sanitize(req.body.hospital),
			department: sanitize(req.body.department),
			position: sanitize(req.body.position)
		};
		Doctor.findOneAndUpdate({slug:req.session.slug},newProfile,function(err,doctor){
			if (doctor){
				res.redirect('/info-form/:slug');
			}
		});
	} else if(req.session.type === "Patient"){
		newProfile = {
			phone: sanitize(req.body.phone),
			address: sanitize(req.body.address),
			email: sanitize(req.body.email),
		};
		Patient.findOneAndUpdate({slug:req.session.slug},newProfile,function(err,patient){
			if (patient){
				res.redirect('/info-form/:slug');
			}
		});
	}
});


app.get('/appointment-rate/:slug', (req, res) => {
	let currentAppointment = {};
	let slug = req.params.slug;
	let currDoctor;
	Appointment.findOne({slug:slug},function(err,appointment){
		if (appointment){
			currentAppointment = appointment;
			Doctor.findOne({id:appointment.doctor_id},function(err,doctor){
				currDoctor  = doctor;
				if (doctor){
					MedicalProfile.findOne({patient_id:currentAppointment.patient_id}, function(err,data){
						if (data){
							res.render("appointmentRate",{appointment:currentAppointment,doctor:currDoctor,medicalProfile:data,slug:slug});
						} else {
							new MedicalProfile({
								patient_id:currentAppointment.patient_id
							}).save(function(err,data){
								if (data){
									res.render("appointmentRate",{appointment:currentAppointment,doctor:currDoctor,medicalProfile:data,slug:slug});
								}
							});
						}
					});
				}
			});
		}
	});

/*
	const slug = sanitize(req.params.slug);
	Appointment.findOne({slug: slug}, function(err, appointment) {
		if (err) {
			res.render('appointmentDetaill', {error: true});
		} else {
			res.render('appointmentDetail', {appointment: appointment});

		}
	});
	*/
});

app.get('/appointments/:slug', (req, res) => {
	let currentAppointment = {};
	let slug = req.params.slug;
	let currDoctor;
	Appointment.findOne({slug:slug},function(err,appointment){
		if (appointment){
			currentAppointment = appointment;
			Doctor.findOne({id:appointment.doctor_id},function(err,doctor){
				currDoctor  = doctor;
				if (doctor){
					MedicalProfile.findOne({patient_id:currentAppointment.patient_id}, function(err,data){
						if (data){
							res.render("appointmentDetail",{appointment:currentAppointment,doctor:currDoctor,medicalProfile:data,slug:slug});
						} else {
							new MedicalProfile({
								patient_id:currentAppointment.patient_id
							}).save(function(err,data){
								if (data){
									res.render("appointmentDetail",{appointment:currentAppointment,doctor:currDoctor,medicalProfile:data,slug:slug});
								}
							});
						}
					});
				}
			});
		}
	});
});
async function getDoctorAndPatient(current_app){
	current_app = await Doctor.findOne({id:current_app.doctor_id}, function(error, doctor){
		if (doctor){
			current_app.doctor_name = doctor.name;
			current_app.doctor_email = doctor.email;
			Patient.findOne({id:current_app.patient_id},function(err,patient){
				current_app.patient_name = patient.name;
				current_app.patient_email = patient.email;
			});
		}
	});
};

function getRandom(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


app.listen(3000);


