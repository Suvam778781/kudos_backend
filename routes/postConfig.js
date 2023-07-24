

const express=require('express')
const { handlePostController } = require('../controllers/postController')
const { isUser } = require('../middleware/isUser')

const PostRouter=express.Router()

PostRouter.post("/post",isUser,handlePostController)

module.exports={
    PostRouter
}