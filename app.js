//jshint esversion:6
 const dotenv = require('dotenv').config();
 const express =require("express");
 const bodyParser = require("body-parser");
 const ejs = require("ejs");
 const mongoose = require('mongoose');
 const session = require('express-session');
 const passport = require("passport");
 const passportLocalMongoose = require("passport-local-mongoose");
 const saltRounds = 10;



 const app = express();

 console.log(process.env.API_KEY);

 app.use(express.static("public"));
 app.set('view engine','ejs');
 app.use(bodyParser.urlencoded({extended:true}));

 app.use(session({
   secret: "Our little secret.",
   resave:false,
   saveUninitialized: false,
   cookie: {secure: true}
 }));

 app.use(passport.initialize());
 app.use(passport.session());




 mongoose.connect("mongodb://localhost:27017/userDB");

 var UserSchema =  new mongoose.Schema({
 email : String,
 password : String
 }, { collection: 'User'});

UserSchema.plugin(passportLocalMongoose);




 var User = mongoose.model('User', UserSchema, 'User');


 // use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});
app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("login");
  }
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/login");
})

app.post("/register", function(req,res){

 User.register({username: req.body.username},req.body.password, function(err,user){
   if(err){
     console.log(err);
     res.redirect("register");
   }else{
    passport.authenticate("local")(req,res, function(){
      res.redirect("secrets");
    })
   }
 })

});


app.post("/login", function(req,res){

 const user = new User({
   username: req.body.username,
   password: req.body.password
 });

 req.login(user,function(err){
   if (err){
     console.log(err)
   }else{
     passport.authenticate("local")(req,res, function(){
       res.redirect("secrets");
     });

   }
 })

})

 app.listen(3000, function(){
   console.log("Server started on port 3000")
 });
