const { connection, pool } = require("../config/db");
const { fetchCommentsForPost } = require("../utils/fetchComentsForPost");
const { getCurrentDateTime } = require("../utils/generateCurrentDate");
const { verifyJwt } = require("../utils/verifyJWT");

const handleLike = async (req, res) => {
  const { post_id } = req.params;
  const { authorization } = req.headers;
  let { id, email } = await verifyJwt(authorization);

  try {
    // Acquire a connection from the pool
    // Check if the user has already liked the post
    pool.query(
      "SELECT * FROM like_post WHERE post_id = ? AND user_id = ?",
      [post_id, id],
      (err, result) => {
        console.log(result, post_id, id, email);
        if (err) {
          return res.status(500).json({ error: "Internal Server Error", err });
        }
        if (result.length > 0) {
          // User already liked the post, so remove the like entry
          pool.query(
            "DELETE FROM like_post WHERE post_id = ? AND user_id = ?",
            [post_id, id],
            (errDelete, resultDelete) => {
              if (errDelete) {
                return res
                  .status(500)
                  .json({ error: "Internal Server Error", errDelete });
              }

              // Decrease the like_count on the post table
              pool.query(
                "UPDATE post SET like_count = like_count - 1 WHERE post_id = ?",
                [post_id],
                (errUpdate, resultUpdate) => {
                  if (errUpdate) {
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error", errUpdate });
                  }

                  return res
                    .status(200)
                    .json({ message: "Like removed successfully" });
                }
              );
            }
          );
        } else {
          // Create a new like entry
          pool.query(
            "INSERT INTO like_post (like_user_email, post_id, user_id) VALUES (?, ?, ?)",
            [email, post_id, id],
            (errInsert, resultInsert) => {
              if (errInsert) {
                return res
                  .status(500)
                  .json({ error: "Internal Server Error", errInsert });
              }

              // Increase the like_count on the post table
              pool.query(
                "UPDATE post SET like_count = like_count + 1 WHERE post_id = ?",
                [post_id],
                (errUpdate, resultUpdate) => {
                  if (errUpdate) {
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error", errUpdate });
                  }

                  return res
                    .status(200)
                    .json({ message: "Post liked successfully" });
                }
              );
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error handling like:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleComment = async (req, res) => {
  const { authorization } = req.headers;
  const { email } = await verifyJwt(authorization); // Implement this function to extract the email from the Authorization header

  const { post_id } = req.params;
  const { user_comment } = req.body;
  try {
    // Create a new comment entry
    const date = getCurrentDateTime();
    pool.query(
      "INSERT INTO comments (user_commented_email, user_comment, commented_at_post, created_at) VALUES (?, ?, ?, ?)",
      [email, user_comment, post_id, date],
      (err, result) => {
        if (err) {
          console.error("Error handling comment:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json({ message: "Comment added successfully" });
      }
    );
  } catch (error) {
    console.error("Error handling comment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleAllPosts = async (req, res) => {
  try {
    pool.query("SELECT * FROM post", async (err, result) => {
      if (err) {
        console.error("Error retrieving posts:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Convert the result to an array to use map
      const posts = Array.from(result);

      // Fetch comments for each post and add them as a 'comments' property
      for (const post of posts) {
        post.comments = await fetchCommentsForPost(post.post_id);
      }

      return res.status(200).json({ posts });
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleUserLikedPosts = async (req, res) => {
  const { authorization, emailtoken } = req.headers;
  const user_id = verifyJwt(authorization);
  const { email } = await verifyJwt(emailtoken); // Implement this function to extract the user email from the Authorization header

  try {
    pool.query(
      "SELECT p.post_id, p.title, p.content, p.author, p.created_at, p.updated_at, p.like_count " +
        "FROM post p INNER JOIN like_post l ON p.post_id = l.post_id " +
        "WHERE l.like_user_email = ?",
      [email],
      (err, result) => {
        if (err) {
          console.error("Error retrieving liked posts:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json({ likedPosts: result });
      }
    );
  } catch (error) {
    console.error("Error retrieving liked posts:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleGetSinglePost = async (req, res) => {
  const { post_id } = req.params;

  try {
    if (!post_id) {
      return res
        .status(400)
        .json({ error: "Post ID is required in the request body." });
    }

    pool.query(
      "SELECT * FROM post WHERE post_id = ?",
      [post_id],
      async (err, result) => {
        if (err) {
          console.error("Error retrieving the post:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: "Post not found." });
        }

        const post = result[0];
        post.comments = await fetchCommentsForPost(post.post_id);

        return res.status(200).json({ post });
      }
    );
  } catch (error) {
    console.error("Error retrieving the post:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const handelGetSingleCategory = async (req, res) => {
  try {
    const { filter } = req.query;
    // Check if the 'category' parameter is provided in the request
    if (!filter) {
      return res.status(400).json({ error: "Category is required in the request params." });
    }

    const query = "SELECT * FROM post WHERE category = ?";
    const queryParams = [filter];

    pool.query(query, queryParams, async (err, result) => {
      if (err) {
        console.error("Error retrieving posts for category:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Convert the result to an array to use map
      const posts = Array.from(result);

      // Fetch comments for each post and add them as a 'comments' property
      for (const post of posts) {
        post.comments = await fetchCommentsForPost(post.post_id);
      }

      return res.status(200).json({ posts });
    });
  } catch (error) {
    console.error("Error in handelGetSingleCategory:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};




module.exports = {
  handleComment,
  handleLike,
  handleAllPosts,
  handleUserLikedPosts,
  handleGetSinglePost,
  handelGetSingleCategory,
};
