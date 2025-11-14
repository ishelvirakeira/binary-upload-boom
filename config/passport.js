const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

//we need the verify callback to be an async function; the User.findOne and user.comparePassword calls(asynchronous op) can be await
module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async(email, password, done) => {
      
      (async()=>{
        const user = await User.findOne({ email: email.toLowerCase() });
  
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        }
        if (!user.password) {
          return done(null, false, {
            msg:
              "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.",
          });
        }
        //comparePassword wrapper
        const isMatch = await new Promise((resolve, reject)=>{
          user.comparePassword(password, (err, match)=>{//(err, isMatch) => {
          if (err) return reject(err);
          resolve(match);
          });
        });
          if(!isMatch){
            return done(null, false, {msg:"Invalid email or password."})
          }
          return done(null, user);
      
          //if (isMatch) {
           // return done(null, user);
          //}
          //return done(null, false, { msg: "Invalid email or password." });
        })//().catch(err=>done(err));
      })
    //})
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async(id, done) => {
    const user = await User.findById(id);
    done(null, user)
    //User.findById(id, (err, user) => done(err, user));
  });
};
