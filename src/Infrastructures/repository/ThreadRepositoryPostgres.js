const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread({ title, body, owner }) {
    const id = `thread-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO threads (id, title, body, owner) VALUES ($1, $2, $3, $4) RETURNING id, title, owner",
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread(result.rows[0]);
  }
  async verifyThreadExists(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("THREAD_REPOSITORY.THREAD_NOT_FOUND");
    }
    return true; // Returns true if the thread exists
  }
  async getThreadById(threadId) {
    const query = {
      text: `
          SELECT t.id, t.title, t.body, t.date, u.username
          FROM threads t
          JOIN users u ON t.owner = u.id
          WHERE t.id = $1
        `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error("THREAD_REPOSITORY.THREAD_NOT_FOUND");
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
