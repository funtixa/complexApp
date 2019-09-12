const usersCollection = require('../db').db().collection("users")
const followsCollection = require('../db').db().collection("follows")
const ObjectId = require('mongodb').ObjectID

let Follow = function (followedUsername, authorId) {
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanup = function () {
    if (typeof (this.followedUsername) != "string") {
        this.followedUsername = ""
    }
}

Follow.prototype.validate = async function () {
    //followed Username must exist in db
    let followedAccount = await usersCollection.findOne({ username: this.followedUsername })
    if (followedAccount) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("cant follow not existed user")

    }
}

Follow.prototype.create = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanup()
        await this.validate()
        if (!this.errors.length) {
            await followsCollection.insertOne({ followedId: this.followedId, authorId: new ObjectId(this.authorId) })
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

module.exports = Follow