const express = require('express');
const ejs = require('ejs');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser  = require('cookie-parser');

const port = process.env.PORT || 3000;

const app = express();

//passport config
require('./strategies/passport')(passport);
//importing routes
const userRoutes = require('./routes/users');

//engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middlewares for bodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser('secret'));

//Middleware for session
app.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//Global Variables 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//db configuration
const db = require('./database/db_url').url;

//db connection
mongoose
    .connect(db, ({useUnifiedTopology: true, useNewUrlParser:true}))
    .then(() => console.log('MongoDB connected!!!'))
    .catch(err => console.log(err));

    //Initial routes
 app.get('', (req, res) =>  res.render('index'));
    
app.use('/', userRoutes);

app.listen(port, (req, res) => console.log(`Server is running at ${port}`));