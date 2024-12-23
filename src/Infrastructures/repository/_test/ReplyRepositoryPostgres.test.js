const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const Reply = require("../../../Domains/replies/entities/Reply");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist a new reply and return the added reply correctly", async () => {
      // Arrange
      const threadId = "thread-123";
      const commentId = "comment-123";
      const owner = "user-123"; // Define the owner
      const content = "This is a reply";

      // Add a user
      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      // Add a thread
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });

      // Add a comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        content: "A comment",
        owner,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Action
      const addedReply = await replyRepository.addReply({
        commentId,
        content,
        owner, // Pass the owner here
      });

      // Assert
      expect(addedReply).toStrictEqual({
        id: "reply-123",
        content,
        owner,
      });
    });
    it("should throw error when commentId does not exist", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");
      const invalidCommentId = "comment-nonexistent";
      const content = "This is a reply";
      const owner = "user-123";

      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      // Action & Assert
      await expect(
        replyRepository.addReply({
          commentId: invalidCommentId,
          content,
          owner,
        }),
      ).rejects.toThrowError("REPLY_REPOSITORY.COMMENT_NOT_FOUND");
    });
    it("should throw an error if an unexpected database error occurs", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      const replyPayload = {
        commentId: "invalid-comment-id", // This ID format will induce a different kind of error
        content: "This is a reply",
        owner: "user-123",
      };

      // Action & Assert
      await expect(
        replyRepository.addReply(replyPayload),
      ).rejects.toThrowError();
    });
    it("should throw the original error when it is not a foreign key constraint violation", async () => {
      // Arrange
      const mockPool = {
        query: jest
          .fn()
          .mockRejectedValue(new Error("Some unexpected database error")),
      };
      const replyRepository = new ReplyRepositoryPostgres(
        mockPool,
        () => "123",
      );

      const replyPayload = {
        commentId: "comment-123",
        content: "This is a reply",
        owner: "user-123",
      };

      // Action & Assert
      await expect(replyRepository.addReply(replyPayload)).rejects.toThrowError(
        "Some unexpected database error",
      );
      expect(mockPool.query).toHaveBeenCalled();
    });
  });

  describe("deleteReplyById function", () => {
    it("should soft delete the reply correctly", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => "123",
      );

      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";
      const userId = "user-123";

      // Add user
      await UsersTableTestHelper.addUser({
        id: userId,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      // Add thread with required fields
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread title",
        body: "Thread body",
        owner: userId,
      });

      // Add comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        content: "This is a comment",
        owner: userId,
      });

      // Add reply
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: commentId,
        content: "This is a reply",
        owner: userId,
      });

      // Action
      await replyRepositoryPostgres.deleteReplyById(replyId);

      // Assert
      const result = await pool.query(
        "SELECT is_delete FROM replies WHERE id = $1",
        [replyId],
      );
      expect(result.rows[0].is_delete).toBe(true); // Ensure the reply is soft deleted
    });
    it("should return replies with original content when is_delete is FALSE", async () => {
      // Arrange
      const commentId = "comment-123";
      const replyId = "reply-123";
      const owner = "user-123";
      const username = "dicoding";
      const date = new Date().toISOString();
      const content = "This is a reply";

      // Insert necessary data
      await UsersTableTestHelper.addUser({ id: owner, username });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "A thread",
        body: "Thread body",
        owner,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner,
        threadId: "thread-123",
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content,
        commentId,
        owner,
        is_delete: false, // Ensure is_delete is FALSE
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepository.getRepliesByCommentId(commentId);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toEqual(
        expect.objectContaining({
          id: replyId,
          username,
          date: expect.any(Date),
          content,
        }),
      );
    });

    it("should return replies with '**balasan telah dihapus**' when is_delete is TRUE", async () => {
      // Arrange
      const commentId = "comment-123";
      const replyId = "reply-124";
      const owner = "user-123";
      const username = "dicoding";
      const content = "This is a deleted reply";

      // Insert necessary data
      await UsersTableTestHelper.addUser({ id: owner, username });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "A thread",
        body: "Thread body",
        owner,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner,
        threadId: "thread-123",
      });

      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        content,
        owner,
        date: new Date(),
        isDelete: true, // Ensure is_delete is TRUE
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action
      const rawReplies = await replyRepository.getRepliesByCommentId(commentId);
      const replies = rawReplies.map((reply) => new Reply(reply)); // Use Reply entity

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual(
        new Reply({
          id: replyId,
          username,
          date: expect.any(Date), // Ensure date is still matched as a Date
          content,
          is_delete: true,
        }),
      );
    });

    it("should throw REPLY_REPOSITORY.REPLY_NOT_FOUND when reply does not exist", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        replyRepositoryPostgres.getReplyOwner("nonexistent-id"),
      ).rejects.toThrowError("REPLY_REPOSITORY.REPLY_NOT_FOUND");
    });
    it("should throw REPLY_REPOSITORY.NOT_AUTHORIZED when the user is not the owner", async () => {
      // Arrange
      const userId = "user-123";
      const otherUserId = "user-456";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId, username: "dicoding" });
      await UsersTableTestHelper.addUser({
        id: otherUserId,
        username: "otheruser",
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "Thread Title", // Fix: Add title
        body: "Thread Body", // Fix: Add body
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: otherUserId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwnership(replyId, userId),
      ).rejects.toThrowError("REPLY_REPOSITORY.NOT_AUTHORIZED");
    });
    it("should succeed when the user is the owner", async () => {
      // Arrange
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId, username: "dicoding" });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "Thread Title", // Fix: Add title
        body: "Thread Body", // Fix: Add body
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwnership(replyId, userId),
      ).resolves.not.toThrow();
    });
    it("should return the owner of the reply when the reply exists", async () => {
      // Arrange
      const replyId = "reply-123";
      const ownerId = "user-123";
      const commentId = "comment-123";

      await UsersTableTestHelper.addUser({
        id: ownerId,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "A thread",
        body: "Thread body",
        owner: ownerId,
      });

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: "thread-123",
        content: "A comment",
        owner: ownerId,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        content: "A reply",
        owner: ownerId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Action
      const replyOwner = await replyRepository.getReplyOwner(replyId);

      // Assert
      expect(replyOwner).toBe(ownerId);
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return replies by comment ID with correct formatting", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => "123",
      );

      const threadId = "thread-123";
      const commentId = "comment-123";
      const userId = "user-123";
      const replyId1 = "reply-123";
      const replyId2 = "reply-456";

      // Add user
      await UsersTableTestHelper.addUser({
        id: userId,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      // Add thread with required fields
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread title",
        body: "Thread body",
        owner: userId,
      });

      // Add comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        content: "This is a comment",
        owner: userId,
      });

      // Add replies
      await RepliesTableTestHelper.addReply({
        id: replyId1,
        comment_id: commentId,
        content: "This is the first reply",
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId2,
        comment_id: commentId,
        content: "This is the second reply",
        owner: userId,
      });

      // Action
      const replies =
        await replyRepositoryPostgres.getRepliesByCommentId(commentId);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies).toEqual([
        expect.objectContaining({
          id: replyId1,
          content: "This is the first reply",
          username: "dicoding",
        }),
        expect.objectContaining({
          id: replyId2,
          content: "This is the second reply",
          username: "dicoding",
        }),
      ]);
    });
    it("should return replies when they exist", async () => {
      // Arrange: Add a user, thread, comment, and reply
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "dicoding",
        password: "password",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread title",
        body: "Thread body",
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        content: "A comment",
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        content: "A reply to the comment",
        owner: userId,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Act
      const replies = await replyRepository.getRepliesByCommentId(commentId);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toEqual(
        expect.objectContaining({
          id: replyId,
          content: "A reply to the comment",
          username: "dicoding", // Expect username instead of owner
          date: expect.any(Date), // Expect the date to be present
        }),
      );
    });
    it("should return an empty array when no replies exist", async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");
      const replies = await replyRepository.getRepliesByCommentId(
        "nonexistent-comment",
      );

      expect(replies).toEqual([]);
    });
  });

  describe("getReplyOwner function", () => {
    beforeAll(() => {
      jest.mock("../../database/postgres/pool");
    });
    it("should throw REPLY_REPOSITORY.REPLY_NOT_FOUND when the reply does not exist", async () => {
      // Arrange
      pool.query = jest.fn().mockResolvedValueOnce({ rowCount: 0 });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => "123",
      );
      const nonexistentReplyId = "reply-does-not-exist";

      // Act & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists(nonexistentReplyId),
      ).rejects.toThrowError("REPLY_REPOSITORY.REPLY_NOT_FOUND");
    });
  });
});
