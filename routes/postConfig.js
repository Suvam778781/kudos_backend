

const express=require('express')
const { handlePostController } = require('../controllers/postController')
const { isUser } = require('../middleware/isUser')
const { upload } = require('../middleware/multer')

const PostRouter=express.Router()
PostRouter.use(express.urlencoded({extended:false}))

PostRouter.post("/post",upload.single("post_img"),isUser,handlePostController)

module.exports={
    PostRouter
}