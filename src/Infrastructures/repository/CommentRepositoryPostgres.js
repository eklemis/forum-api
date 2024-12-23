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

    return result.rowCount > 0; // Returns true if comment exists, false otherwise
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
}

module.exports = CommentRepositoryPostgres;
