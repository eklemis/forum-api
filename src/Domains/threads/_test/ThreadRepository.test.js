const ThreadRepository = require("../ThreadRepository");

describe("ThreadRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED",
    );
  });
  it("should throw error when verifyThreadExists is called", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(
      threadRepository.verifyThreadExists("thread-123"),
    ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
  it("should throw error when invoking abstract method `getThreadById`", async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(
      threadRepository.getThreadById("thread-123"),
    ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
