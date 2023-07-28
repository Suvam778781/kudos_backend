const { pool } = require("../config/db");

const fetchCommentsForPost = (postId) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM comment WHERE commented_at_post = ?",
        [postId],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  };


  module.exports={fetchCommentsForPost}