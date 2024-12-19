class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, replyId, owner }) {
    await this._threadRepository.verifyThreadExists(threadId);

    await this._commentRepository.verifyCommentExists(commentId);

    await this._replyRepository.verifyReplyExists(replyId);

    await this._replyRepository.verifyReplyOwnership(replyId, owner);

    // Perform soft delete
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
