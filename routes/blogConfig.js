
const express=require('express');
const {handleComment,handleComment} =require("../controllers/blogController")
const blogConfigRoute=express.Router();

blogConfigRoute.post('/addcomment',handleComment);
blogConfigRoute.post('/addlike',handleLike);

