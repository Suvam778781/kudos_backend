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
  const { user_comment } = req.body;
  const { post_id } = req.params;

  if (!user_comment || !post_id) {
    return res.status(301).send({ error: "body cannot be empty" });
  }

  const timeFn = getCurrentDateTime();

  const findNameQ = "SELECT given_name from user where email=?";
  pool.query(findNameQ, [email], (err, result) => {
    if (err) {
      return res.status(301).send("not able to find the Name of user by given email", err);
    } else {
      const personName = result[0].given_name;

      try {
        // Create a new comment entry
        const date = getCurrentDateTime();
        pool.query(
          "INSERT INTO comment (user_commented_email, user_comment, commented_at_post, user_commented_name, created_at) VALUES (?, ?, ?, ?, ?)",
          [email, user_comment, post_id, personName, timeFn],
          (err, result) => {
            if (err) {
              console.error("Error handling comment:", err);
              return res.status(500).json({ error: "Internal Server Error", err });
            }

           

            // Retrieve the inserted comment from the database to construct the full response
            pool.query(
              "SELECT * FROM comment WHERE comment_id = ?",
              [result.insertId], // Assuming comment_id is the primary key or auto-incremented field
              (err, commentResult) => {
                if (err) {
                  console.error("Error retrieving comment:", err);
                  return res.status(500).json({ error: "Internal Server Error" });
                }

                const fullResponse = commentResult[0];

                return res.status(200).json({
                  message: "Comment added successfully",
                  comment: fullResponse,
                });
              }
            );
          }
        );
      } catch (error) {
        console.error("Error handling comment:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  });
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
      return res
        .status(400)
        .json({ error: "Category is required in the request params." });
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

const handelDeleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

   

    const { authorization } = req.headers;
    if (!comment_id || !authorization) {
      return res.status(301).send({ error: "post_id or auth cannot be blank" });
    }

    const { email } = await verifyJwt(authorization);

    const email_in_comment_tb_Q = 'SELECT user_commented_email from comment where comment_id=?';
    pool.query(email_in_comment_tb_Q, [comment_id], (err, result) => {
      if (err) {
        return res.status(301).send({ error: "cannot complete req at the moment", err });
      }
      const email_present_in_Db = result[0]?.user_commented_email;

      if (!email_present_in_Db) {
        return res.status(301).send({ error: "not authorized" });
      } else if (email_present_in_Db === email) {
        const delQ = 'DELETE FROM comment WHERE comment_id=?';
        pool.query(delQ, [comment_id], (err, result) => {
          if (err) {
            return res.status(301).send({ error: "cannot process req", err });
          } else {
            return res.status(200).send({ success: "del succ", comment_id: comment_id });
          }
        });
      } else {
        return res.status(400).send('not verified');
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "cannot del now", error });
  }
};


module.exports = {
  handleComment,
  handleLike,
  handleAllPosts,
  handleUserLikedPosts,
  handleGetSinglePost,
  handelGetSingleCategory,
  handelDeleteComment
};
