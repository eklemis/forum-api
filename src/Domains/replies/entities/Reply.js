class Reply {
  constructor({ id, username, date, content, is_delete }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? "**balasan telah dihapus**" : content;
  }
}

module.exports = Reply;
