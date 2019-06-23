const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      user       = require("../models/user"),
      async      = require("async"),
      nodemailer = require("nodemailer"),
      crypto     = require("crypto");
router.get('/',(req,res) => {

  res.render( "landing");
});
//==============================================================
//            AUTH ROUTES
//==================================================================
router.get("/register",function(req,res){
          res.render("register");
});

router.post("/register",function(req,res){
  let newUser = new user({
    username: req.body.username,

    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatarx: req.body.avatarx
  });
user.register(newUser , req.body.password,function(err,user){
  if(err)
  {req.flash("error",err);
    console.log(err);
    return res.render("register",{currentUser:req.user});

  }
   passport.authenticate("local")(req, res, () => {
     req.flash("success","Welcome to GeekTalks");
res.redirect("/techblog");
   });
});
});
//==============================================================
//Login
//==============================================================
// show login form
router.get("/login", (req, res) => res.render("login",{currentUser:req.user,page: "login"}));

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect('/login');
    }
    req.logIn(user, err => {
      if (err) { return next(err); }
      let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/techblog';
      delete req.session.redirectTo;
      req.flash("success", "Good to see you again, " + user.username);
      res.redirect(redirectTo);
    });
  })(req, res, next);
});
//=========================================================================================
//password_reset router
//=========================================================================================
router.get("/password_reset",function(req,res){
  //res.send("you can reset password");
res.render("password_reset", {
    user: req.user
  });

});

// send confirmation emails
router.post("/password_reset", (req, res, next) => {
  // use waterfall to increase readability of the following callbacks
  async.waterfall([
    function(done) {
      // generate random token
      crypto.randomBytes(20, (err, buf) => {
        let token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      // find who made the request and assign the token to them
      user.findOne({ email: req.body.email }, (err, user) => {

        if (err) throw err;
        if (!user) {
          req.flash("error", "That GeekTalks account doesn't exist.");
          return res.redirect("/password_reset");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 36000000000; // ms, 1hour

        user.save(err => done(err, token, user));
        console.log(user.username);
      });
    },
    function(token, user, done) {
      // indicate email account and the content of the confirmation letter
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "archanayadav14898@gmail.com",
          pass: "cffhjkl"
        }
      });
      let mailOptions = {
        from: "archanayadav14898@gmail.com",
        to: user.email,
        subject: "Reset your GeekTalks Password",
        text: "Hi " + user.firstName + ",\n\n" +
              "We've received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using this link:\n\n" +
               req.headers.host + "/reset/" + token + "\n\n" +
              "Thanks.\n"+
              "The GeekTalks Team\n"
      };
      // send the email
      smtpTransport.sendMail(mailOptions, err => {
        if (err) console.log(err);
        console.log("mail sent");
        req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], err => {
    if (err) return next(err);
    res.redirect("/password_reset");
  });
});

//==============================================================================================
//reset ROUTES
//==============================================================================================
router.get('/reset/:token', function(req, res) {
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {

    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/password_reset');
    }
     else { res.render("reset", { token: req.params.token }) }
  });
});
// update password
router.post("/reset/:token", (req, res) => {
  async.waterfall([
    function(done) {
      user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
console.log(user.username);
        if (err) throw err;
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/password_reset");
        }
        // check password and confirm password
        if (req.body.password === req.body.confirm) {
          // reset password using setPassword of passport-local-mongoose
          user.setPassword(req.body.password, err => {
            if (err) throw err;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;

            user.save(err => {
              if (err) throw err;
              req.logIn(user, err => {
                done(err, user);
              });
            });
          });
        } else {
          req.flash("error", "Passwords do not match");
          return res.redirect("back");
        }
      });
    },
    function(user, done) {
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "archanayadav14898@gmail.com",
          pass: "xyvvv"
        }
      });
      let mailOptions = {
        from: "archanayadav14898@gmail.com",
        to: user.email,
        subject: "Your GeekTalks Password has been changed",
        text: "Hi " + user.firstName + ",\n\n" +
              "This is a confirmation that the password for your account " + user.email + "  has just been changed.\n\n" +
              "Best,\n"+
              "The GeekTalks Team\n"
      };
      smtpTransport.sendMail(mailOptions, err => {
        if (err) throw err;
        req.flash("success", "Your password has been changed.");
        done(err);
      });
    },
  ], err => {
    if (err) throw err;
    res.redirect("/techblog");
  });
});
//===============================================================================================
// logout route
//===============================================================================================
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out seccessfully. Look forward to seeing you again!");
  res.redirect("/techblog");
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("success","YOU ARE LOGOUT");
  res.redirect("/login");
}

module.exports = router;
