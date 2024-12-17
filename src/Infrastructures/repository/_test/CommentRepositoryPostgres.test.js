const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");

describe("addComment function", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable(); // Clean up users
    await ThreadsTableTestHelper.cleanTable(); // Clean up threads
  });

  afterAll(async () => {
    await pool.end();
  });
  it("should persist a new comment and return added comment correctly", async () => {
    // Arrange
    const commentRepositoryPostgres = new CommentRepositoryPostgres(
      pool,
      () => "123",
    );
    const threadId = "thread-123";
    const content = "This is a comment";
    const owner = "user-123";

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
      body: "This is a thread body",
      owner,
    });

    // Action
    const addedComment = await commentRepositoryPostgres.addComment(
      threadId,
      content,
      owner,
    );

    // Assert
    const result = await pool.query("SELECT * FROM comments WHERE id = $1", [
      addedComment.id,
    ]);
    const persistedComment = result.rows[0];

    expect(addedComment).toStrictEqual({
      id: "comment-123",
      content,
      owner,
    });
    expect(persistedComment).toBeDefined();
    expect(persistedComment.thread_id).toEqual(threadId);
    expect(persistedComment.content).toEqual(content);
    expect(persistedComment.owner).toEqual(owner);
  });
  it("should throw an error when owner does not exist", async () => {
    // Arrange
    const commentRepositoryPostgres = new CommentRepositoryPostgres(
      pool,
      () => "123",
    );
    const threadId = "thread-123";
    const content = "This is a comment";
    const nonExistentOwner = "user-not-exist";

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      title: "A thread",
      body: "This is a thread body",
      owner: "user-123",
    });

    // Action & Assert
    await expect(
      commentRepositoryPostgres.addComment(threadId, content, nonExistentOwner),
    ).rejects.toThrowError();
  });
});

describe("CommentRepositoryPostgres", () => {
  it("should create an instance of CommentRepositoryPostgres correctly", () => {
    // Arrange
    const mockIdGenerator = () => "123";

    // Action
    const commentRepositoryPostgres = new CommentRepositoryPostgres(
      pool,
      mockIdGenerator,
    );

    // Assert
    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepositoryPostgres);
    expect(commentRepositoryPostgres._pool).toBeDefined();
    expect(commentRepositoryPostgres._idGenerator).toBeDefined();
  });
});
