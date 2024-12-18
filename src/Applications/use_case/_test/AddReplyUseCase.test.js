const AddReplyUseCase = require("../AddReplyUseCase");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

describe("AddReplyUseCase", () => {
  it("should throw error when payload is missing required property", async () => {
    // Arrange
    const useCasePayload = {};
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      "ADD_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload does not meet data type specification", async () => {
    // Arrange
    const useCasePayload = {
      threadId: 123, // Invalid type
      commentId: 456, // Invalid type
      content: true, // Invalid type
      owner: [], // Invalid type
    };
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      "ADD_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });

  it("should orchestrate the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      content: "sebuah balasan",
      owner: "user-123",
    };

    const expectedAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    };

    const mockReplyRepository = {
      addReply: jest.fn().mockResolvedValue(expectedAddedReply),
    };

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.addReply).toBeCalledWith({
      commentId: useCasePayload.commentId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    expect(addedReply).toStrictEqual(expectedAddedReply);
  });
});
