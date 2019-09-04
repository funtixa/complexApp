const postCollection = require('../db').db().collection("posts")
const ObjectID = require('mongodb').ObjectID

let Post = function(data, userid){
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.create = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            // save post into DB
            postCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Spróbuj proszę później")
                reject(this.errors)
            })
            
        }else{
            reject(this.errors)
        }
    })
}
Post.prototype.cleanUp = function(){
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}  

    // get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate : new Date(),
    author: ObjectID(this.userid)                 // <--  Js ma wbudowany construktor Date który można użyć
   }
}

Post.prototype.validate = function(){
    if(this.data.title == "") {this.errors.push("Musisz podać tytuł")}
    if(this.data.body == "") {this.errors.push("Musisz coś naskrobać ;P")}
}


module.exports = Post