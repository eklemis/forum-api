const Comment = require("../Comment");

describe("Comment entity", () => {
  it("should display original content and default likeCount when not deleted", () => {
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: "2024-12-24T11:38:05.438Z",
      content: "This is a comment",
      is_delete: false,
    };

    const comment = new Comment(payload);
    const expectedComment = new Comment({
      ...payload,
      likeCount: 0, // Default likeCount
    });

    expect(comment).toStrictEqual(expectedComment);
  });

  it("should display deleted comment message and likeCount when is_delete is true", () => {
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: "2024-12-24T11:38:05.438Z",
      content: "This is a comment",
      is_delete: true,
      likeCount: 5,
    };

    const comment = new Comment(payload);
    const expectedComment = new Comment(payload);

    expect(comment).toStrictEqual(expectedComment);
  });
});
