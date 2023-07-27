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
blogConfigRoute.get("/getuserlikepost", handleUserLikedPosts);
blogConfigRoute.get("/getallpost", handleAllPosts);

module.exports = { blogConfigRoute };
