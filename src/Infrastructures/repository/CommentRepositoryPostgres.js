const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(threadId, content, owner) {
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO comments (id, thread_id, content, owner) VALUES ($1, $2, $3, $4) RETURNING id, content, owner",
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1",
      values: [commentId],
    };

    await this._pool.query(query);
  }
  async verifyCommentExists(commentId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    // Returns true if comment exists, false otherwise

    return result.rowCount > 0;
  }
  async getCommentOwner(commentId) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new Error("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    }

    return result.rows[0].owner;
  }
  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id, c.content, c.date, u.username, c.is_delete
        FROM comments c
        JOIN users u ON c.owner = u.id
        WHERE c.thread_id = $1
        ORDER BY c.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
  async checkUserLikedComment(userId, commentId) {
    const query = {
      text: "SELECT id FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2",
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0; // Returns true if the user liked the comment, false otherwise
  }
  async likeComment(userId, commentId) {
    const query = {
      text: `
        INSERT INTO user_comment_likes (user_id, comment_id)
        VALUES ($1, $2)
      `,
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(userId, commentId) {
    const query = {
      text: "DELETE FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2",
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }
  async getLikeCount(commentId) {
    const query = {
      text: "SELECT COUNT(*) AS like_count FROM user_comment_likes WHERE comment_id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].like_count, 10); // Return the number of likes
  }
}

module.exports = CommentRepositoryPostgres;
