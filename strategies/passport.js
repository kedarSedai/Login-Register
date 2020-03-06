const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../model/User');

module.exports = function(passport) {
    passport.use (
        new localStrategy({usernameField: 'email'}, (email, password, done) => {
            User.findOne({email: email}, (err, data) => {
                if (err) throw err;
                if (!data) return done(null, false, {message: "User Doesn't exists.."});

                bcrypt.compare(password, data.password, (err, match) => {
                    if (err) {
                        return done(null, false);
                    }
                    if (!match) {
                        return done(null,false, {message: "Password doesn't match"});
                    } 
                    if (match) {
                        return done(null, data);
                    }
                })
            });
        })
    )
    passport.serializeUser(function(user, cb) {
        cb(null, user.id);
    });
    
    passport.deserializeUser(function(id, cb) {
        User.findById(id, function(err, user) {
            cb(err, user);
        });
    });
}