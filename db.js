// db.js
const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// my schema goes here!
const Review = new mongoose.Schema({
  rating: {type: Number, required: true, min: 0, max: 5},
  name: String,
  text: {type: String, required: true}
});

const Book = new mongoose.Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  isbn: {type: String, required: true, minlength: 10, maxlength: 13},
  reviews: [Review]
});

Book.plugin(URLSlugs('title author'));

mongoose.model("Review", Review);
mongoose.model("Book", Book);


mongoose.connect('mongodb://localhost/???', { useNewUrlParser: true });