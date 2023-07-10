const {connection} =require("../config/db")
const { getCurrentDateTime }=require('../utils/generateCurrentDate');
const { verifyJwt }= require('../utils/verifyJWT');

const handleLike = async (req, res) => {
    const { post_id } = req.params;
    const { authorization,emailtoken } = req.headers;
    const user_id = verifyJwt(authorization)
    const like_user_email = verifyJwt(emailtoken)
    
    try {
      // Check if the user has already liked the post
      const [rows] = await connection.execute(
        'SELECT * FROM like_post WHERE post_id = ? AND user_id = ?',
        [post_id, user_id]
      );
  
      if (rows.length > 0) {
        // User already liked the post, so remove the like entry
        await connection.execute('DELETE FROM like_post WHERE post_id = ? AND user_id = ?', [post_id, user_id]);
        // Decrease the like_count on the post table
        await connection.execute('UPDATE post SET like_count = like_count - 1 WHERE post_id = ?', [post_id]);
        return res.status(200).json({ message: 'Like removed successfully' });
      }
  
      // Create a new like entry
      await connection.execute('INSERT INTO likes (like_user_email, post_id, user_id) VALUES (?, ?, ?)', [
        like_user_email,
        post_id,
        user_id,
      ]);
      // Increase the like_count on the post table
      await connection.execute('UPDATE post SET like_count = like_count + 1 WHERE post_id = ?', [post_id]);
      return res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
      console.error('Error handling like:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.end();
    }
  };
  

const handleComment=async(req, res)=>{
    const { authorization } = req.headers;
    const user_commented_email = verifyJwt(authorization); // Implement this function to extract the email from the Authorization header
  
    const { commented_at_post: commentedAtPost } = req.params;
    const { user_comment } = req.body;
    try {
      // Create a new comment entry
      const date=getCurrentDateTime()
      await connection.execute(
        'INSERT INTO comments (user_commented_email, user_comment, commented_at_post, created_at) VALUES (?, ?, ?, ?)',
        [user_commented_email, user_comment, commentedAtPost,date]
      );
  
      return res.status(200).json({ message: 'Comment added successfully' });
    } catch (error) {
      console.error('Error handling comment:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.end();
    }
  }

  const handleAllPosts=async(req, res)=>{
    try {
      const [rows] = await connection.execute(
        'SELECT post_id, title, content, author, created_at, updated_at, like_count FROM post'
      );
      return res.status(200).json({ posts: rows });
    } catch (error) {
      console.error('Error retrieving posts:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.end();
    }
  }

const handleUserLikedPosts=async(req, res)=>{

  const { authorization,emailtoken } = req.headers;
  const user_id = verifyJwt(authorization)
  const like_user_email = verifyJwt(emailtoken) // Implement this function to extract the user email from the Authorization header

  try {
    const [rows] = await connection.execute(
      'SELECT p.post_id, p.title, p.content, p.author, p.created_at, p.updated_at, p.like_count ' +
        'FROM post p INNER JOIN like_post l ON p.post_id = l.post_id ' +
        'WHERE l.like_user_email = ?',
      [like_user_email]
    );

    return res.status(200).json({ likedPosts: rows });
  } catch (error) {
    console.error('Error retrieving liked posts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.end();
  }
}
  
  module.exports={handleComment, handleLike, handleAllPosts, handleUserLikedPosts}