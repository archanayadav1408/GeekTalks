const express    = require("express"),
      router     = express.Router(),
      blog = require("../models/blog");

//show all blogs
router.get('/techblog',(req,res) => {
blog.find({},function(err,allblogs){
  if(err)
   req.flash("error",err);
   else{
     res.render("blogs/index",{blogs:allblogs});
   }
});
});


//CREATE - show new blogs added
router.post("/techblog", function(req,res)
{
  //data from form
  var name = req.body.name;
  var image = req.body.image;
  var desc  = req.body.description;
  var author = {
    username: req.user.username,
    id: req.user._id
  }
  var newblog = {name:name ,image:image , description:desc ,author:author}

  blog.create(newblog,function(err,blog)
  {
      if(err){
        console.log(err);
      }
      else {
         console.log("created");
        req.flash("success","Blog created");
         console.log(blog);
      }
    });

  //redirect to techblog
res.redirect("/techblog");
});
//show form to create new blog
router.get('/techblog/new',isLoggedIn,(req,res) => {

res.render("blogs/new.ejs");

});

router.get("/techblog/:id",function(req,res){
  blog.findById(req.params.id).populate("comments").exec(function(err,blog){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      res.render("blogs/show" ,{blog:blog});

    }
  });

});

router.get("/techblog/:id/edit",checkOwnerOfBlog, (req, res) => {

  blog.findById(req.params.id , function(err,blog){
    if(err)
    console.log(err);
    else {
      res.render("blogs/edit" ,{blog:blog});  }
  });

});

router.put("/techblog/:id",checkOwnerOfBlog,function(req,res){
  console.log(req.body.blog);
  blog.findByIdAndUpdate(req.params.id ,req.body.blog,function(err,Updatedblog){
    if(err){
      res.redirect("/techblog");
    }
    else {
      req.flash("success","Blog Updated");
    res.redirect("/techblog/"+req.params.id);
    }
  });
});

router.delete("/techblog/:id",checkOwnerOfBlog,(req, res) => {

blog.findByIdAndRemove(req.params.id, err => {
    if (err) { res.redirect("/techblog"); }
    else {
          req.flash("success","Blog Removed");
      res.redirect("/techblog"); }
  });
});



function isLoggedIn(req,res,next){

  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error","You have to login first");
  res.redirect("/login");
}


function checkOwnerOfBlog(req,res,next){
  if(req.isAuthenticated()){
  blog.findById(req.params.id , function(err,blog){
    if(err)
    {
    console.log(err);
  }
  else {

      if(blog.author.id.equals(req.user._id))
    {
    next();
}
else {
  req.flash("error","You are not the owner of the blog");
  res.redirect("back");
}
    }
  });
}
else
{ req.flash("error","Login first");
  res.redirect("back");
}
}

module.exports = router;
