/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const ThreadsTableTestHelper = {
  async addThread({ id, title, body, owner }) {
    const query = {
      text: "INSERT INTO threads (id, title, body, owner) VALUES ($1, $2, $3, $4)",
      values: [id, title, body, owner],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM threads WHERE 1=1");
  },
};

module.exports = ThreadsTableTestHelper;
