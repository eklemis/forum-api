const AddedReply = require("../AddedReply");

describe("AddedReply entity", () => {
  it("should create AddedReply object correctly", () => {
    const payload = {
      id: "reply-123",
      content: "This is a reply",
      owner: "user-123",
    };
    const addedReply = new AddedReply(payload);

    expect(addedReply).toEqual(payload);
  });

  it("should throw error when required properties are missing", () => {
    const payload = { id: "reply-123", content: "This is a reply" }; // missing owner
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when properties do not match data type", () => {
    const payload = { id: 123, content: [], owner: true }; // invalid data types
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
});
