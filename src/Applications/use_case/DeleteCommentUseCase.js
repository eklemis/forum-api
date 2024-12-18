class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, owner }) {
    if (!threadId || !commentId || !owner) {
      throw new Error("DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    const threadExists =
      await this._threadRepository.verifyThreadExists(threadId);
    if (!threadExists) {
      throw new Error("DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND");
    }

    const commentExists =
      await this._commentRepository.verifyCommentExists(commentId);
    if (!commentExists) {
      throw new Error("DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND");
    }

    const commentOwner =
      await this._commentRepository.getCommentOwner(commentId);
    if (commentOwner !== owner) {
      throw new Error("DELETE_COMMENT_USE_CASE.NOT_AUTHORIZED");
    }

    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
