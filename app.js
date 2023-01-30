//jshint esversion:6
require('dotenv').config()
console.log(process.env.API_KEY) //Test .env works.

const express = require("express");
// const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();
app.use(express.static("Public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.json());

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    userName: String,
    password: String
}) 
///Encryption, secret string instead of two keys

userSchema.plugin(encrypt, {secret:process.env.SECRET_KEY, encryptedFields:['password']});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res)=>{
    res.render("home");
});

app.route("/register")
.get((req, res)=>{
    res.render("register");
})
.post((req, res)=>{
    User.findOne({userName: req.body.username}, (err, foundUser)=>{
        if(!err) {
            if (foundUser===null) {
                const newUser=new User({
                    userName: req.body.username,
                    password: req.body.password
                });
                newUser.save();
                console.log("New user is created.");
                res.render("secrets") 
            } else {
                console.log("User has been registered.");
                res.redirect("/login") 
            }   
        }      
        }
    ); 
    });

app.route("/login")
.get((req, res)=>{
    res.render("login");
})
.post((req, res)=>{
    const userName=req.body.username;
    const password=req.body.password;
    User.findOne({userName: req.body.username},(err, foundUser)=>{
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password===password) {
                    res.render("secrets");
                }
            }
        }
    });
});

app.listen(3000, ()=>{
    console.log("Server started on port 3000");
});