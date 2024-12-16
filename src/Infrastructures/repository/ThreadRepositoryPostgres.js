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
}

module.exports = ThreadRepositoryPostgres;