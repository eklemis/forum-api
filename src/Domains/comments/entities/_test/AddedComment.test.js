const AddedComment = require("../AddedComment");

describe("AddedComment entity", () => {
  it("should throw error when payload does not contain needed property", () => {
    const payload = { content: "a comment", owner: "user-123" }; // Missing 'id'

    expect(() => new AddedComment(payload)).toThrowError(
      "ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload properties do not meet data type specification", () => {
    const payload = { id: 123, content: "a comment", owner: "user-123" }; // id is not a string

    expect(() => new AddedComment(payload)).toThrowError(
      "ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
  it("should create AddedComment object correctly when given valid payload", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "a comment",
      owner: "user-123",
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
