
const express=require('express');
const {handleComment,handleComment} =require("../controllers/blogController")
const blogConfigRoute=express.Router();

blogConfigRoute.post('/addcomment/:post_id',handleComment);
blogConfigRoute.post('/addlike/:post_id',handleLike);

