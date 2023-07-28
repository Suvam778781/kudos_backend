const express = require("express");
const {
  handleComment,
  handleLike,
  handleAllPosts,
  handleUserLikedPosts,
  handleGetSinglePost,
} = require("../controllers/blogController");
const blogConfigRoute = express.Router();

blogConfigRoute.post("/addcomment/:post_id", handleComment);
blogConfigRoute.post("/addlike/:post_id", handleLike);
blogConfigRoute.get("/getuserlikepost", handleUserLikedPosts);
blogConfigRoute.get("/getallpost", handleAllPosts);
blogConfigRoute.get('/getallpost/:post_id',handleGetSinglePost)

module.exports = { blogConfigRoute };
