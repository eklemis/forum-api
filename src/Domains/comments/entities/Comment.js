class Comment {
  constructor({ id, username, date, content, is_delete }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? "**komentar telah dihapus**" : content;
  }
}

module.exports = Comment;
