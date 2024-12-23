const ReplyRepository = require("../../Domains/replies/ReplyRepository");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({ commentId, content, owner }) {
    try {
      const id = `reply-${this._idGenerator()}`;
      const query = {
        text: `
            INSERT INTO replies (id, comment_id, content, owner)
            VALUES ($1, $2, $3, $4)
            RETURNING id, content, owner`,
        values: [id, commentId, content, owner],
      };

      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23503") {
        throw new Error("REPLY_REPOSITORY.COMMENT_NOT_FOUND");
      }
      throw error;
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: `
        UPDATE replies
        SET is_delete = TRUE
        WHERE id = $1`,
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT r.id, u.username, r.date, r.content, r.is_delete
        FROM replies r
        INNER JOIN users u ON r.owner = u.id
        WHERE r.comment_id = $1
        ORDER BY r.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getReplyOwner(replyId) {
    const query = {
      text: `
        SELECT owner
        FROM replies
        WHERE id = $1`,
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error("REPLY_REPOSITORY.REPLY_NOT_FOUND");
    }

    return result.rows[0].owner;
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: "SELECT id FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error("REPLY_REPOSITORY.REPLY_NOT_FOUND");
    }
  }
  async verifyReplyOwnership(replyId, owner) {
    const query = {
      text: `SELECT owner FROM replies WHERE id = $1`,
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== owner) {
      throw new Error("REPLY_REPOSITORY.NOT_AUTHORIZED");
    }
  }
}

module.exports = ReplyRepositoryPostgres;
