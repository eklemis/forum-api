const Comment = require("../Comment");

describe("Comment entity", () => {
  it("should display deleted comment message when is_delete is true", () => {
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: new Date(),
      content: "A comment",
      is_delete: true,
    };

    const comment = new Comment(payload);

    expect(comment).toEqual({
      id: "comment-123",
      username: "dicoding",
      date: payload.date,
      content: "**komentar telah dihapus**",
    });
  });

  it("should display original content when is_delete is false", () => {
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: new Date(),
      content: "A comment",
      is_delete: false,
    };

    const comment = new Comment(payload);

    expect(comment).toEqual({
      id: "comment-123",
      username: "dicoding",
      date: payload.date,
      content: "A comment",
    });
  });
});
