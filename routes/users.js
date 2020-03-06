const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = require('../model/User');
const { ensureAuthenticated } = require('../strategies/auth');

//Rendering login page
router.get('/login', (req, res) => res.render('index'));

//Rendering register page
router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {

    //validation
    var { email, username, password, confirmpassword } = req.body;
    var err;

    if (!email || !username || !password || !confirmpassword ) {
        err = 'please fill all the fields';
        res.render('register', {'err': err});
    }
    if (password != confirmpassword) {
        err = 'password dont match';
        res.render('register', {'err': err, 'email': email, 'username': username});
    }

    //checking email exists
    const existEmail = await User.findOne({email: req.body.email});
    if (existEmail) {
        err = 'Email Already exists';
        res.render('register', {'err':err});
    }

    //hashed password 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User ({
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword
    });
    
    try {
        const savedUser = await user.save();
        req.flash('success_msg', "Register success");
        res.redirect('/login');
        
    } catch(err) {
        console.log(err.message);
    } 
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/success',
        failureFlash: true,
    }) (req, res, next);
});

//logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', "You are logged out..")
    res.redirect('/login');
});

router.get('/success', ensureAuthenticated, (req, res) => res.render('success', {'user': req.user}));

//Adding Message
router.post('/addmsg', ensureAuthenticated, (req, res) => {
    User.findOneAndUpdate(
        { email: req.user.email },
       { $push: {
            messages: req.body['msg']
       }}, (err, success ) => {
           if(err) throw err;
           if(success) console.log('Added');
       }
    );
    res.redirect('/success');
});

module.exports = router;