const usersCollection = require('../db').db().collection("users")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const md5 = require("md5")


let User = function(data, getAvatar){
    this.data = data
    this.errors = []
    if(getAvatar == undefined){getAvatar = false}
    if(getAvatar){this.getAvatar()}
}

User.prototype.cleanUp = function() {
  if (typeof(this.data.username) != "string") {this.data.username = ""}
  if (typeof(this.data.email) != "string") {this.data.email = ""}
  if (typeof(this.data.password) != "string") {this.data.password = ""}

  // get rid of any bogus properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
    }
}



User.prototype.validate = function(){
    return new Promise(async (resolve, reject) => {
        if (this.data.username == ""){this.errors.push("Musisz wypełnić to pole. ")}
        if (validator.isEmail(this.data.email) == ""){this.errors.push("Musisz wprowadzić poprawny adres email.")}
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)){this.errors.push("Nazwa użytkownika a-z 0-9.")}
        if (this.data.password == "") {this.errors.push("You must provide a password.")}
        if (this.data.password.length > 0 && this.data.password.length < 6) {this.errors.push("Password must be at least 6 characters.")}
        if (this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 characters.")}
        if (this.data.username.length > 0 && this.data.username.length < 3){this.errors.push("Nazwa użytkownika musi posiadać co najmniej 12 znaków")}
        if (this.data.username.length >30){this.errors.push("Nazwa użytkownika nie może być dłuższa niż 30 znaków.")}
    
        //only if username is valid check to see if its already taken
        if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)){
            let usernameExists = await usersCollection.findOne({username: this.data.username})
            if (usernameExists) {this.errors.push("Username is already taken.")}
        }
        //only if email is valid check to see if it`s already taken
        if (validator.isEmail(this.data.email)){
            let emailExists = await usersCollection.findOne({email: this.data.email})
            if (emailExists) {this.errors.push("E-mail is already being used.")}
        }
        resolve()
    })
}


User.prototype.login = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp()
    usersCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
        if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){  //porównuje
            this.data = attemptedUser
            this.getAvatar()
            resolve("Congrats")
        }else{
            reject("invalid username/pass")
        }
    }).catch(function(){
        reject("Proszę spróbuj później")
    })
    })
}

User.prototype.register = function(){
    return new Promise(async(resolve, reject) => {
        // Step #1: Validate user data
        this.cleanUp()
        await this.validate()
        
      
        // Step #2: Only if there are no validation errors 
        if(!this.errors.length){
            // hash user password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        }else{
            reject(this.errors)
        }
      })
}

User.prototype.getAvatar = function(){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username) {
    return new Promise(function(resolve, reject) {
        if(typeof(username)!= "string"){
            reject()
            return
    }
    usersCollection.findOne({username: username}).then(function(userDoc){
       if(userDoc){
           userDoc = new User(userDoc, true)
           userDoc = {
               _id: userDoc.data._id,
               username: userDoc.data.username,
               avatar: userDoc.avatar
           }
           resolve(userDoc)
       } else{
           reject()
       }
    }).catch(function(){
        reject()
    })
    })
}
module.exports = User