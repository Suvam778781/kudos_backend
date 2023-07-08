import mysql from 'mysql2/promise';
import { connection } from '../config/db';

const handleLike=async(req, res)=>{
  const { post_id} = req.query;
  try {
    // Check if the user has already liked the post
    const [rows] = await connection.execute(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [post_id, user.id]
    );

    if (rows.length > 0) {
      // User already liked the post, so remove the like entry
      await connection.execute('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user.id]);
      return res.status(200).json({ message: 'Like removed successfully' });
    }
    // Create a new like entry
    await connection.execute('INSERT INTO likes (like_user_email, post_id, user_id) VALUES (?, ?, ?)', [
      user.email,
      post_id,
      user.id,
    ]);
    return res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error handling like:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.end();
  }
}


const handleComment=async(req, res)=>{
    const { authorization } = req.headers;
    const user_commented_email = verifyToken(authorization); // Implement this function to extract the email from the Authorization header
  
    const { commented_at_post: commentedAtPost } = req.query;
    const { user_comment } = req.body;
    try {
      // Create a new comment entry
      await connection.execute(
        'INSERT INTO comments (user_commented_email, user_comment, commented_at_post, created_at) VALUES (?, ?, ?, ?)',
        [user_commented_email, user_comment, commentedAtPost, new Date()]
      );
  
      return res.status(200).json({ message: 'Comment added successfully' });
    } catch (error) {
      console.error('Error handling comment:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.end();
    }
  }
  module.exports={handleComment, handleLike}