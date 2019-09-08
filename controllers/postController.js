const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
  res.render('create-post')
}

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id)
  post.create().then(function() {
    res.render('/profile')
  }).catch(function(errors) {
    res.send(errors)
  })
}

exports.viewSingle = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    res.render('single-post-screen', {post: post})
  } catch {
    res.render('404')
  }
}

exports.viewEditScreen = async function(req, res){
    try {
        let post = await Post.findSingleById(req.params.id)
    res.render("edit-post", {post: post})
    } catch {
        res.render('404')
    }
}

exports.edit = function(req, res){
  let post = new Post(req.body, req.visitorId, req.params.id)
  post.update().then((status) => {
    //the post was successfuly updated in the database
    // or user did have PermissionRequest, but there were validation errors
    if(status == "success"){
      //post was updated in db
      req.flash("success", "Post successfully updated.")
      req.session.save(function(){
        res.redirect(`post/${req.params.id}/edit`)
      })
    } else {
      post.errors.forEach(function(error){
        req.flash("errors", error)
      })
      req.session.save(function(){
        res.redirect(`/post/${req.params.id}/edit`)
      })
    }
  }).catch(() => {
    // a post with requested id doesn`t exist
    //or if the current visitor is not the owner of the requested post
    req.flash('errors', "Nie masz uprawnień do zlecenia tej akcji. ")
  })
}