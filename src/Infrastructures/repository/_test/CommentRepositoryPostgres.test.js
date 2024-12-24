const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyCommentExists function", () => {
    it("should return true when comment exists", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const threadId = "thread-123";
      const owner = "user-123-comment";

      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicoding-comment",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });

      const commentId = `comment-123`;
      await pool.query({
        text: "INSERT INTO comments (id, thread_id, content, owner) VALUES ($1, $2, $3, $4)",
        values: [commentId, threadId, "A comment", owner],
      });

      // Action
      const exists =
        await commentRepositoryPostgres.verifyCommentExists(commentId);

      // Assert
      expect(exists).toBe(true);
    });

    it("should return false when comment does not exist", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );

      // Action
      const exists = await commentRepositoryPostgres.verifyCommentExists(
        "nonexistent-comment",
      );

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe("getCommentOwner function", () => {
    it("should return the correct owner when comment exists", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const threadId = "thread-123";
      const owner = "user-123";

      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });

      const commentId = `comment-123`;
      await pool.query({
        text: "INSERT INTO comments (id, thread_id, content, owner) VALUES ($1, $2, $3, $4)",
        values: [commentId, threadId, "A comment", owner],
      });

      // Action
      const commentOwner =
        await commentRepositoryPostgres.getCommentOwner(commentId);

      // Assert
      expect(commentOwner).toBe(owner);
    });

    it("should throw an error when comment does not exist", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.getCommentOwner("nonexistent-comment"),
      ).rejects.toThrowError("COMMENT_REPOSITORY.COMMENT_NOT_FOUND");
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return an empty array when there are no comments for the given thread id", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );

      const threadId = "thread-123-empty";

      // Act
      const comments =
        await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(0);
    });

    it("should return comments with deleted content marked correctly", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const threadId = "thread-123-del";
      const owner = "user-123-del";

      // Arrange: Add user, thread, and a deleted comment
      await UsersTableTestHelper.addUser({
        id: owner,
        username: "dicodingDel",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread",
        body: "Thread body",
        owner,
      });
      const commentId = "comment-123-del";
      await pool.query({
        text: `
          INSERT INTO comments (id, thread_id, content, owner, is_delete)
          VALUES ($1, $2, $3, $4, $5)
        `,
        values: [commentId, threadId, "A deleted comment", owner, true],
      });

      // Act
      const comments =
        await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments).toStrictEqual([
        {
          id: commentId,
          username: "dicodingDel",
          date: expect.any(Date),
          content: "A deleted comment",
          is_delete: true,
        },
      ]);
    });
  });
  describe("checkUserLikedComment function", () => {
    it("should return true when the user liked the comment", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const commentId = "comment-123";
      const userId = "user-123";

      // Arrange: Add user, thread, comment, and like
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner: userId,
        threadId: "thread-123",
      });
      await LikesTableTestHelper.addLike({ userId, commentId });

      // Act
      const result = await commentRepositoryPostgres.checkUserLikedComment(
        userId,
        commentId,
      );

      // Assert
      expect(result).toBe(true);
    });
    it("should return false when the user did not like the comment", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const commentId = "comment-123";
      const userId = "user-123";

      // Arrange: Add user, thread, and comment
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner: userId,
        threadId: "thread-123",
      });

      // Act
      const result = await commentRepositoryPostgres.checkUserLikedComment(
        userId,
        commentId,
      );

      // Assert
      expect(result).toBe(false);
    });
  });
  describe("likeComment function", () => {
    it("should like a comment successfully", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const commentId = "comment-123";
      const userId = "user-123";

      // Arrange: Add user, thread, and comment
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner: userId,
        threadId: "thread-123",
      });

      // Act
      await commentRepositoryPostgres.likeComment(userId, commentId);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
      expect(likes[0].user_id).toEqual(userId);
    });
  });
  describe("unlikeComment function", () => {
    it("should unlike a comment successfully", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const commentId = "comment-123";
      const userId = "user-123";

      // Arrange: Add user, thread, comment, and like
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        owner: userId,
        threadId: "thread-123",
      });
      await LikesTableTestHelper.addLike({ userId, commentId });

      // Act
      await commentRepositoryPostgres.unlikeComment(userId, commentId);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });
  });
  describe("getLikeCount function", () => {
    it("should return the correct like count for a comment", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => "123",
      );
      const commentId = "comment-123";
      const userId1 = "user-123-likes";
      const userId2 = "user-456-likes";

      // Arrange: Add users, thread, comment, and likes
      await UsersTableTestHelper.addUser({
        id: userId1,
        username: "user123likes",
        password: "secret",
        fullname: "User 123 Likes",
      });
      await UsersTableTestHelper.addUser({
        id: userId2,
        username: "user456likes",
        password: "secret",
        fullname: "User 456 Likes",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123-likes",
        title: "A thread for likes",
        body: "Thread content for likes",
        owner: userId1,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment for likes",
        owner: userId1,
        threadId: "thread-123-likes",
      });
      await LikesTableTestHelper.addLike({ userId: userId1, commentId });
      await LikesTableTestHelper.addLike({ userId: userId2, commentId });

      // Act
      const likeCount = await commentRepositoryPostgres.getLikeCount(commentId);

      // Assert
      expect(likeCount).toBe(2);
    });
  });
});
