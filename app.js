
var express = require('express');
//create logger for our app
var morgan = require('morgan');
var mongoose = require('mongoose');
//library for password to improve security
var bcrypt = require('bcrypt-nodejs');
// take your body of req to url
var bodyParser = require('body-parser');
var ejs = require('ejs');
// we want create more flexible web pages
var ejsmate = require('ejs-mate');
var session = require('express-session');//save userId into a temporary memory
var cookieParser= require('cookie-parser');//parse the cookie header,pass session data to Broswer
var flash= require('express-flash');//depend on session and cookie
var MongoStore = require('connect-mongo/es5')(session);// save session on MongoDB
var passport = require('passport');
//load my local schemas
var User = require('./models/userschema');
var Category= require('./models/category');
var secret = require('./config/secret');

var Cart = require('./models/cart');

var app = express();

//connect our MongoDB using mLab
mongoose.connect(secret.database,function(err){
  if (err) console.log(err);
  else console.log("Connected to DB");
});


//this is the middleware

app.use(morgan('dev'));
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());//we can parse json data format
app.use(bodyParser.urlencoded({extended:true}));// we can parse x-www-form-urlencoded format
app.use(cookieParser());
app.use(flash());
app.use(session({

  resave:true,//force the session to save to the session store
  saveUninitialized:true, //save to memory
  secret:secret.secretKey,
  store:new MongoStore({url:secret.database, autoReconnect: true})
}));
app.use(passport.initialize());//start passport
app.use(passport.session());//for serialize and deserialize

app.engine('ejs',ejsmate);
app.set('view engine','ejs');

app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.use(function(req,res,next){
  if(req.user){
    var total=0;
    Cart.findOne({owner:req.user._id},function(err,cart){
      if (err) return next(err);
      //loop all the items and add quantity of each one
      if (cart){
          for(var i=0; i<cart.items.length; i++){
            total = total +cart.items[i].quantity;

          }
          res.locals.cart = total;
          req.cart=total;
      }else{

        res.locals.cart= 0;
      }
  next();
    })//end of findOne

  }//end if
  else{
    next();
  }


})


//local routes
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);//right now we don't need nest route
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);//we can omit the '/api' in the front







app.listen(secret.port,function(err){

if (err) throw err;
console.log("Server Start");

})
