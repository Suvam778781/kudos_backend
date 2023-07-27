const { pool } = require("../config/db");
const { imageLink } = require("../utils/uploadimg");

const handlePostController = async(req, res) => {
  try {
    const { category, title, content } = req.body;
    const author_id = req.body.users_id;

    console.log(req.body.users_id,"this body")


   

    if(!author_id){
      return res.status(301).send({err:"authorId cannot be null login again"})
    }

  

    const post_img=await imageLink(req,res)
    
    const author_nameQ = "SELECT given_name, id FROM user WHERE user_id = ?";
    if(!category||!title||!content){
      return res.status(301).send({"err":"feild are required before posting"})
    }

    pool.query(author_nameQ, [author_id], (err, result) => {
      if (err)
        return res
          .status(301)
          .send({ error: "error while fetching author detail" });
      else {
        //getting id and given name from query
        const {given_name,id} = result[0];
        const postQ = "INSERT INTO post (`user_id`, `category`, `title`, `content`, `post_img`, `author`) VALUES (?, ?, ?, ?, ?, ?)";




        pool.query(
          postQ,
          [id, category, title, content, post_img,given_name],
          (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(301)
                .send({ error: "error while inserting the post" });
            } else {
              res.status(200).send({ succ: "post updated success" });
            }
          }
        );
      }
    });
  } catch (error) {
    console.log(error, "error in post router Controller");
    return res.status(500).send({ error: "error within", error });
  }
};

module.exports = {
  handlePostController,
};
