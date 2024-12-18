const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");

const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist thread and return added thread correctly", async () => {
      // Arrange
      const fakeIdGenerator = () => "123"; // Stub for nanoid
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const threadPayload = {
        title: "sebuah thread",
        body: "isi sebuah thread",
        owner: "user-123",
      };

      // Action
      const addedThread =
        await threadRepositoryPostgres.addThread(threadPayload);

      // Assert: Ensure returned entity is correct
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual("thread-123");
      expect(addedThread.title).toEqual(threadPayload.title);
      expect(addedThread.owner).toEqual(threadPayload.owner);

      // Assert: Verify data in database
      const result = await pool.query("SELECT * FROM threads WHERE id = $1", [
        addedThread.id,
      ]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toEqual("thread-123");
      expect(result.rows[0].title).toEqual(threadPayload.title);
      expect(result.rows[0].body).toEqual(threadPayload.body);
      expect(result.rows[0].owner).toEqual(threadPayload.owner);
    });
    it("should persist thread with long title and special characters", async () => {
      const fakeIdGenerator = () => "456";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const threadPayload = {
        title: "This is a very long title with special characters! 🤖✨",
        body: 'Here is a body with special characters: "quotes", emojis 🎉, and more.',
        owner: "user-456",
      };

      const addedThread =
        await threadRepositoryPostgres.addThread(threadPayload);

      const result = await pool.query("SELECT * FROM threads WHERE id = $1", [
        addedThread.id,
      ]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toEqual(threadPayload.title);
      expect(result.rows[0].body).toEqual(threadPayload.body);
    });
    it("should throw an error when database connection fails", async () => {
      const fakeIdGenerator = () => "789";
      const mockPool = {
        query: jest.fn(() => {
          throw new Error("Database connection failed");
        }),
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        mockPool,
        fakeIdGenerator,
      );

      const threadPayload = {
        title: "Thread title",
        body: "Thread body",
        owner: "user-789",
      };

      await expect(
        threadRepositoryPostgres.addThread(threadPayload),
      ).rejects.toThrowError("Database connection failed");
    });
  });

  describe("getThreadById function", () => {
    it("should return thread details when the thread exists", async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool);
      const userId = "user-123-GTBI";
      const threadId = "thread-123";

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "dicodingGTBI",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: "A thread title",
        body: "Thread body",
        owner: userId,
      });

      // Act
      const thread = await threadRepository.getThreadById(threadId);

      // Assert: Compare individual properties to allow for `date` flexibility
      expect(thread.id).toBe(threadId);
      expect(thread.title).toBe("A thread title");
      expect(thread.body).toBe("Thread body");
      expect(thread.username).toBe("dicodingGTBI");
      expect(thread.date).toBeInstanceOf(Date);

      // Optional: Validate the date is in ISO format
      const isoDate = thread.date.toISOString();
      expect(isoDate).toEqual(expect.any(String));
    });

    it("should throw NotFoundError when the thread does not exist", async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool);

      // Act & Assert
      await expect(
        threadRepository.getThreadById("nonexistent-thread"),
      ).rejects.toThrowError("THREAD_REPOSITORY.THREAD_NOT_FOUND");
    });
  });
});
