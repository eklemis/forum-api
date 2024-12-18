const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteCommentUseCase", () => {
  it("should throw an error when payload does not contain required properties", async () => {
    // Arrange
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute({})).rejects.toThrowError(
      "DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it("should throw an error when the thread does not exist", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock verifyThreadExists to return false
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute({
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123",
      }),
    ).rejects.toThrowError("DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND");

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123",
    );
  });
  it("should throw an error when the comment does not exist", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock verifyThreadExists to return true
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    // Mock verifyCommentExists to return false
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute({
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123",
      }),
    ).rejects.toThrowError("DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND");

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123",
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-123",
    );
  });
  it("should throw an error when the owner is not authorized to delete the comment", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock verifyThreadExists to return true
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    // Mock verifyCommentExists to return true
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    // Mock getCommentOwner to return a different owner
    mockCommentRepository.getCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve("user-different"));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute({
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123", // Unauthorized user
      }),
    ).rejects.toThrowError("DELETE_COMMENT_USE_CASE.NOT_AUTHORIZED");

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123",
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-123",
    );
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith("comment-123");
  });
  it("should orchestrate the soft delete action correctly", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock verifyThreadExists to return true
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    // Mock verifyCommentExists to return true
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    // Mock getCommentOwner to return the correct owner
    mockCommentRepository.getCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve("user-123"));

    // Mock deleteComment to resolve successfully
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute({
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    });

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123",
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-123",
    );
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith("comment-123");
    expect(mockCommentRepository.deleteComment).toBeCalledWith("comment-123");
  });
});
