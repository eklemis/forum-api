const AddThreadUseCase = require("../AddThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");

describe("AddThreadUseCase", () => {
  it("should throw error if payload does not contain needed property", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread", // title is provided
      body: "isi sebuah thread", // body is provided
      // owner is missing here
    };
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    // Act & Assert
    // We use 'rejects' because 'execute' returns a promise.
    // If the use case throws an error, it means the promise is rejected.
    await expect(addThreadUseCase.execute(useCasePayload)).rejects.toThrowError(
      "ADD_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });
  it("should throw error if payload does not meet data type specification", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread",
      body: 123, // invalid type, should be a string
      owner: "user-123",
    };
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    // Act & Assert
    await expect(addThreadUseCase.execute(useCasePayload)).rejects.toThrowError(
      "ADD_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread",
      body: "isi sebuah thread",
      owner: "user-123",
    };
    const expectedAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    // We create a mock ThreadRepository with jest
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest
      .fn()
      .mockResolvedValue(expectedAddedThread);

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    // Check that addThread was called with correct parameters
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    });
    // Check that the result is what we expect
    expect(addedThread).toStrictEqual(expectedAddedThread);
  });
});
