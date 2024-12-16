class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ title, body, owner }) {
    if (!title || !body || !owner) {
      throw new Error("ADD_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof title !== "string" ||
      typeof body !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("ADD_THREAD_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
    const addedThread = await this._threadRepository.addThread({
      title,
      body,
      owner,
    });
    return addedThread;
  }
}

module.exports = AddThreadUseCase;
