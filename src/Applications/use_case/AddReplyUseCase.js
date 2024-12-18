const AddedReply = require("../../Domains/replies/entities/AddedReply");

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { threadId, commentId, content, owner } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const addedReply = await this._replyRepository.addReply({
      commentId,
      content,
      owner,
    });

    return new AddedReply(addedReply);
  }

  _validatePayload({ threadId, commentId, content, owner }) {
    if (!threadId || !commentId || !content || !owner) {
      throw new Error("ADD_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (
      typeof threadId !== "string" ||
      typeof commentId !== "string" ||
      typeof content !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("ADD_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = AddReplyUseCase;
