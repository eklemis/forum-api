/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const LikesTableTestHelper = {
  async addLike({ userId, commentId }) {
    const query = {
      text: "INSERT INTO user_comment_likes (user_id, comment_id) VALUES ($1, $2)",
      values: [userId, commentId],
    };
    await pool.query(query);
  },

  async findLikesByCommentId(commentId) {
    const query = {
      text: "SELECT * FROM user_comment_likes WHERE comment_id = $1",
      values: [commentId],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async deleteLike({ userId, commentId }) {
    const query = {
      text: "DELETE FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2",
      values: [userId, commentId],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM user_comment_likes");
  },
};

module.exports = LikesTableTestHelper;
