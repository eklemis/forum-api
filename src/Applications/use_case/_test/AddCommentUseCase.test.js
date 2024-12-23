const AddCommentUseCase = require("../AddCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("AddCommentUseCase", () => {
  it("should throw error when payload does not contain needed property", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      content: "", // content is missing
      owner: "user-123",
    };

    const mockCommentRepository = new CommentRepository();
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError("ADD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload does not meet data type specification", async () => {
    // Arrange
    const useCasePayload = {
      threadId: 123, // invalid type
      content: "a comment",
      owner: true, // invalid type
    };

    const mockCommentRepository = new CommentRepository();
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      "ADD_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should throw error when thread does not exist", async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() =>
      Promise.resolve(false),
    );

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    const useCasePayload = {
      threadId: "non-existent-thread",
      content: "a comment",
      owner: "user-123",
    };

    // Action & Assert
    await expect(
      addCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError("ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND");

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "non-existent-thread",
    );
  });

  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      content: "a comment",
      owner: "user-123",
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock behavior
    mockThreadRepository.verifyThreadExists = jest.fn(() =>
      Promise.resolve(true),
    );
    mockCommentRepository.addComment = jest.fn(() =>
      Promise.resolve({
        id: "comment-123",
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    );

    // Instantiate the use case
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123",
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      "thread-123",
      "a comment",
      "user-123",
    );
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: "comment-123",
        content: "a comment",
        owner: "user-123",
      }),
    );
  });
});
