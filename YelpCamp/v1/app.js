var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
app.use(bodyParser.urlencoded({extended : true}));

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//SCHEMA SETUP
// var campgroundSchema = new mongoose.Schema({
//   name: String,
//   image: String,
//   description : String
// });

// var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {
//         name: "White Mountain",
//         image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO1Mgrt_QiajEeiXOnkT00Bh7-9CBRPwzllVPvPr770-vHWLIYbQ",
//         description: "This is a great place !!!",
//     }, function(err, campground) {
//       if(err) {
//           console.log(err);
//       }else {
//           console.log("Newly added Campground :");
//           console.log(campground);
//       }
//   });
// 
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function(req, res) {
    res.render("landing");
})

app.get("/campgrounds", function(req, res) {
   Campground.find({}, function(err, allcampgrounds) {
       if(err) {
           console.log(err);
       }else {
           res.render("campgrounds/index", {campgrounds : allcampgrounds, currentUser : req.user});
       }
   });
});

// Create
app.post("/campgrounds", function(req, res) {
    
   var name = req.body.name;
   var image = req.body.image;
   var description = req.body.description;
   var newCampground = {name: name, image: image, description: description};
   
   Campground.create(newCampground, function(err, campground) {
       if(err) {
           console.log(err);
       }else {
           console.log("Newly added Campground :");
           console.log(campground);
           res.redirect("/campgrounds");
       }
   });
});

// Show form to create
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new.ejs");
});

//Show
app.get("/campgrounds/:id", function(req, res){
    //find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, findCampground){
        if(err) {
            console.log(err);
        }else {
            res.render("campgrounds/show", {campground : findCampground});
        }
    });
});

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            console.log(err);
        }else {
            res.render("comments/new", {campground: campground});
        }
    });
})

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
   Campground.findById(req.params.id, function(err, campground){
       if(err) {
           console.log(err);
       }else {
           Comment.create(req.body.comment, function (err, comment) {
               if(err) {
                   console.log(err);
               } else {
                   campground.comments.push(comment);
                   campground.save();
                   res.redirect("/campgrounds/" + campground._id);
               }
           });
       }
   }) 
}); 
//=============
// Auth routes
//=============

//show register form

app.get("/register", function(req, res) {
    res.render("register")
})

app.post("/register", function(req, res){
   var newuser = new User({username: req.body.username});
   User.register(newuser, req.body.password, function(err, user) {
       if(err) {
           console.log(err);
           return res.render("register");
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds");
       })
   }); 
});

//show login form

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res) {
        
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
        
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Sever Has Started !!!"); 
});