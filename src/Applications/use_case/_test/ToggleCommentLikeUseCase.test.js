const ToggleCommentLikeUseCase = require("../ToggleCommentLikeUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("ToggleCommentLikeUseCase", () => {
  it("should orchestrate the toggle like action correctly when user has not liked the comment", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockResolvedValue(true);
    mockCommentRepository.checkUserLikedComment = jest
      .fn()
      .mockResolvedValue(false);
    mockCommentRepository.likeComment = jest.fn();

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await toggleCommentLikeUseCase.execute({
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    });

    // Assert
    expect(result).toEqual({ status: "success" });
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      "thread-123",
    );
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
      "comment-123",
    );
    expect(mockCommentRepository.checkUserLikedComment).toHaveBeenCalledWith(
      "user-123",
      "comment-123",
    );
    expect(mockCommentRepository.likeComment).toHaveBeenCalledWith(
      "user-123",
      "comment-123",
    );
  });

  it("should orchestrate the toggle unlike action correctly when user has already liked the comment", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() =>
      Promise.resolve(true),
    );
    mockCommentRepository.checkUserLikedComment = jest.fn(() =>
      Promise.resolve(true),
    );
    mockCommentRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await toggleCommentLikeUseCase.execute(useCasePayload);

    // Assert
    expect(result).toEqual({ status: "success" });
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123",
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-123",
    );
    expect(mockCommentRepository.checkUserLikedComment).toBeCalledWith(
      "user-123",
      "comment-123",
    );
    expect(mockCommentRepository.unlikeComment).toBeCalledWith(
      "user-123",
      "comment-123",
    );
  });
});
