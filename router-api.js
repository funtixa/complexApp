const apiRouter = require('express').Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')

apiRouter.post('/login', userController.apiLogin)
apiRouter.post('/create-post', userController.apiMustBeLoggedin, postController.apiCreate)
apiRouter.delete('/post/:id', userController.apiMustBeLoggedin, postController.apiDelete)
apiRouter.get('/postsByAuthor/:username',userController.apiGetPostByUsername )

module.exports = apiRouter