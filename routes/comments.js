const express    = require("express"),
      router     = express.Router({ mergeParams: true }),
      blog = require("../models/blog"),
      comment    = require("../models/comment");

//=================================================================================//
//COMMENT//
//==================================================================================//

router.get("/techblog/:id/comment/new",isLoggedIn,function(req,res){

  blog.findById(req.params.id,function(err,blog){
    if(err)
    {
      console.log(err);
    }
    else {
          res.render("comments/new",{blog:blog});
    }
  });

});

router.post("/techblog/:id/comment",isLoggedIn,function(req,res)
{
  blog.findById(req.params.id,function(err,blog){
    if(err)
    {
      console.log(err);
      res.redirect("/techblog");
    }
    else {
      //console.log(req.body.comment);
        comment.create(req.body.comment,function(err,comment){
          if(err){
          console.log(err);}
          else {
            comment.author.id= req.user._id;
            comment.author.username= req.user.username;
            comment.save();
            blog.comments.push(comment);
            blog.save();
            console.log(comment);

            res.redirect("/techblog/"+ blog._id);
          }
        });
    }
  });

});

router.delete("/techblog/:id/comment/:comment_id",checkOwner,(req, res) => {

comment.findByIdAndRemove(req.params.comment_id, err => {
    if (err) { res.redirect("/techblog"); }
    else {

      res.redirect("/techblog/"+req.params.id); }
  });
});

router.get("/techblog/:id/comment/:comment_id/edit",checkOwner, (req, res) => {

  comment.findById(req.params.comment_id , function(err,comment){
    if(err)
    res.redirect("back");
    else {
      res.render("comments/edit" ,{comment:comment , blogs:req.params.id});  }
  });

});

router.put("/techblog/:id/comment/:comment_id/edit",checkOwner,function(req,res){

comment.findByIdAndUpdate(req.params.comment_id ,req.body.comment,function(err,Updatedblog){
    if(err){
      res.redirect("/techblog");
    }
    else {
    res.redirect("/techblog/"+req.params.id);
    }
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}
function checkOwner(req,res,next){
  if(req.isAuthenticated()){
  comment.findById(req.params.comment_id , function(err,comment){
    if(err)
    console.log(err);
    else {
      //console.log(comment);
      if(comment.author.id.equals(req.user._id))
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
{req.flash("error","Login first");
  res.redirect("back");
}
}
module.exports = router;
