const express = require("express");
const {
  handleComment,
  handleLike,
  handleAllPosts,
  handleUserLikedPosts,
} = require("../controllers/blogController");
const blogConfigRoute = express.Router();

blogConfigRoute.post("/addcomment/:post_id", handleComment);
blogConfigRoute.post("/addlike/:post_id", handleLike);
blogConfigRoute.post("/getuserlikepost", handleUserLikedPosts);
blogConfigRoute.post("/getallpost", handleAllPosts);

module.exports = { blogConfigRoute };
