const AddedThread = require("../AddedThread");
const ThreadRepository = require("../../ThreadRepository");

describe("AddedThread entity", () => {
  it("should throw error when payload does not contain needed property", () => {
    const payload = {
      title: "sebuah thread",
      owner: "user-123",
    };

    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it('should throw error when "id" is missing', () => {
    const payload = { title: "thread", owner: "user-123" };
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it('should throw error when "owner" is missing', () => {
    const payload = { id: "thread-123", title: "thread" };
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it("should throw error when payload properties do not meet data type specification", () => {
    const payload = { id: 123, title: true, owner: {} };
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
  it("should create AddedThread object correctly when given valid payload", () => {
    const payload = {
      id: "thread-123",
      title: "sebuah thread",
      owner: "user-123",
    };
    const addedThread = new AddedThread(payload);
    expect(addedThread.id).toBe(payload.id);
    expect(addedThread.title).toBe(payload.title);
    expect(addedThread.owner).toBe(payload.owner);
  });
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });
});
