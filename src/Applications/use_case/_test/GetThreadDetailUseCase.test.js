const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepositoryPostgres = require("../../../Infrastructures/repository/ReplyRepositoryPostgres");
const pool = require("../../../Infrastructures/database/postgres/pool");
const Comment = require("../../../Domains/comments/entities/Comment");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrate the get thread detail action correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const expectedThread = {
      id: "thread-123",
      title: "A thread title",
      body: "Thread body content",
      date: "2024-12-18T12:00:00.000Z",
      username: "dicoding",
    };

    const rawComments = [
      {
        id: "comment-1",
        username: "user1",
        date: "2024-12-18T13:00:00.000Z",
        content: "This is a comment",
        is_delete: false,
      },
      {
        id: "comment-2",
        username: "user2",
        date: "2024-12-18T13:05:00.000Z",
        content: "This comment was deleted",
        is_delete: true,
      },
    ];

    const expectedFormattedThread = {
      ...expectedThread,
      comments: rawComments.map(
        (comment) =>
          new Comment({
            ...comment,
            likeCount: comment.id === "comment-1" ? 2 : 0,
            //replies: [], // Include empty replies array
          }),
      ),
    };

    const mockThreadRepository = new ThreadRepository(pool);
    const mockCommentRepository = new CommentRepository(pool, () => "123");
    const mockReplyRepository = new ReplyRepositoryPostgres(pool, () => "123");

    // Mock repository methods
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(expectedThread);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(rawComments);
    mockCommentRepository.getLikeCount = jest.fn((commentId) =>
      Promise.resolve(commentId === "comment-1" ? 2 : 0),
    );
    mockReplyRepository.getRepliesByCommentId = jest.fn(() =>
      Promise.resolve([]),
    );

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const threadDetail = await getThreadDetailUseCase.execute({ threadId });

    // Assert
    expect(threadDetail).toEqual(expectedFormattedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      threadId,
    );
    expect(mockCommentRepository.getLikeCount).toBeCalledTimes(2);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledTimes(2);
  });

  it("should throw an error when the thread is not found", async () => {
    // Arrange
    const threadId = "thread-404";

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(null);
    mockCommentRepository.getCommentsByThreadId = jest.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      getThreadDetailUseCase.execute({ threadId }),
    ).rejects.toThrowError("GET_THREAD_DETAIL_USE_CASE.THREAD_NOT_FOUND");

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
  });
});
