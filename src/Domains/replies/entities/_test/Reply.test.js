const Reply = require("../Reply");

describe("Reply entity", () => {
  it("should display original content when not deleted", () => {
    const payload = {
      id: "reply-123",
      username: "user",
      date: "2024-12-19T12:00:00.000Z",
      content: "This is a reply",
      is_delete: false,
    };

    const reply = new Reply(payload);

    expect(Object.assign({}, reply)).toStrictEqual({
      id: "reply-123",
      username: "user",
      date: "2024-12-19T12:00:00.000Z",
      content: "This is a reply",
    });
  });

  it("should display deleted content message when is_delete is true", () => {
    const payload = {
      id: "reply-123",
      username: "user",
      date: "2024-12-19T12:00:00.000Z",
      content: "This is a reply",
      is_delete: true,
    };

    const reply = new Reply(payload);

    expect(Object.assign({}, reply)).toStrictEqual({
      id: "reply-123",
      username: "user",
      date: "2024-12-19T12:00:00.000Z",
      content: "**balasan telah dihapus**",
    });
  });
});
