const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const homeStartingContent = "Welcome to my Mock-Blogger. You can view and create the written blogs. The blogs are stored using MongoDB Atlas. To create a new blog, head over to Compose section.";
const aboutContent = "This website was made using EJS, CSS, Express.js, MongoDB Atlas + Mongoose and a pinch of jQuery.";
const contactContent = "No need to contact me :)";

const blogSchema = new mongoose.Schema({
	title: String,
	content: String
});
const blog = mongoose.model('blog', blogSchema);

app.get("/", function(req, res) {
	blog.find({}, function(err, foundPosts) {
		if (err) {
			console.log(err);
		} else {
			res.render('home', {homeStartingContent: homeStartingContent, posts: foundPosts});
		}
	})
	
});

app.get("/about", function(req, res) {
	res.render('about', {aboutContent: aboutContent});
});

app.get("/contact", function(req, res) {
	res.render('contact', {contactContent: contactContent});
});

app.get("/compose", function(req, res) {
	res.render('compose');
});

app.get("/posts/:postTitle", function(req, res) {
	var postTitle = _.capitalize(req.params.postTitle);
	blog.findOne(
		{title: postTitle},
		function(err, foundPost) {
			if (err) {
				console.log(err);
			} else {
				res.render('post', {title: foundPost.title, content: foundPost.content, id: foundPost._id});
			}
		}
	)
});

app.post("/compose", function(req, res) {
	var newBlogTitle = _.capitalize(req.body.newBlogTitle);
	var newBlogContent = req.body.newBlogContent;
	const newPost = new blog({
		title: newBlogTitle,
		content: newBlogContent
	});
	newPost.save();
	res.redirect('/');
});

app.post("/delete", function(req, res) {
	var id;
	if (req.body.hasOwnProperty("delete")) {
		id = req.body.delete;
		blog.findByIdAndDelete(
			{_id: id},
			function(err, foundPost) {
				if (err) {
					console.log(err);
				} else {
					res.redirect("/");
				}
			}
		)
	} else {
		id = req.body.edit;
		var newContent = req.body.newContent;
		blog.findByIdAndUpdate(
			{_id: id},
			{$set: {content: newContent}},
			function(err, foundPost) {
				res.redirect("/");
			}
		)
	}
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
