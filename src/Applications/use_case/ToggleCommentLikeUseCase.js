class ToggleCommentLikeUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, userId }) {
    // Validate that the thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Validate that the comment exists
    const commentExists =
      await this._commentRepository.verifyCommentExists(commentId);
    if (!commentExists) {
      throw new Error("TOGGLE_COMMENT_LIKE_USECASE.COMMENT_NOT_FOUND");
    }

    // Check if the user has already liked the comment
    const hasLiked = await this._commentRepository.checkUserLikedComment(
      userId,
      commentId,
    );

    // Toggle like status
    if (hasLiked) {
      await this._commentRepository.unlikeComment(userId, commentId);
    } else {
      await this._commentRepository.likeComment(userId, commentId);
    }

    return { status: "success" };
  }
}

module.exports = ToggleCommentLikeUseCase;
