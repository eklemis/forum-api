const AddedComment = require("../../Domains/comments/entities/AddedComment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, content, owner }) {
    if (!threadId || !content || !owner) {
      throw new Error("ADD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (
      typeof threadId !== "string" ||
      typeof content !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("ADD_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
    const threadExists =
      await this._threadRepository.verifyThreadExists(threadId);

    if (!threadExists) {
      throw new Error("ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND");
    }

    const addedComment = await this._commentRepository.addComment(
      threadId,
      content,
      owner,
    );

    return new AddedComment(addedComment);
  }
}

module.exports = AddCommentUseCase;
