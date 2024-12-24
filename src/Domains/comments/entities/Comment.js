class Comment {
  constructor({
    id,
    username,
    date,
    content,
    is_delete,
    replies = [],
    likeCount = 0,
  }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? "**komentar telah dihapus**" : content;
    this.likeCount = likeCount;
    this.replies = replies;
  }
}

module.exports = Comment;
