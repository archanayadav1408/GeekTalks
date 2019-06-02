var express    =  require('express'),
   app         =  express(),
   bodyParser  =  require("body-parser"),
   mongoose    =  require("mongoose"),
   blog        =  require("./models/blog") ,
   flash       = require("connect-flash"),
   passport       = require("passport"),
    methodOverride = require("method-override"),
  LocalStrategy  = require("passport-local"),
   comment     =  require("./models/comment"),
    session        = require("express-session"),
   user        =  require("./models/user") ;

   const indexRoute      = require("./routes/index"),
         campgroundRoute = require("./routes/blogs"),
         commentRoute    = require("./routes/comments");

   app.use(express.static(__dirname + '/public'));

   const server = app.listen(process.env.PORT||5000,function()
   {
     console.log("GeekTalks server started ");
   });

   mongoose.connect('mongodb://127.0.0.1/blogdb', { useNewUrlParser: true } , function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Database  Server successfully!');
    }
});
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());

//passport configuration
app.use(session({
  secret: "process.env.SESSIONSECRET",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req, res, next) => {
  res.locals.currentUser = req.user; // req.user is an authenticated user
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use( indexRoute);
app.use( campgroundRoute);
app.use( commentRoute);
