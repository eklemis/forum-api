class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    // Validate and retrieve the thread
    const thread = await this._threadRepository.getThreadById(threadId);
    if (!thread) {
      throw new Error("GET_THREAD_DETAIL_USE_CASE.THREAD_NOT_FOUND");
    }

    // Retrieve comments related to the thread
    const comments =
      await this._commentRepository.getCommentsByThreadId(threadId);

    // Map and format the comments
    const formattedComments = await comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete
        ? "**komentar telah dihapus**"
        : comment.content,
    }));
    for (const comment of formattedComments) {
      const replies = await this._replyRepository.getRepliesByCommentId(
        comment.id,
      );
      comment.replies = replies; // Attach replies to the comment
    }

    // Return the complete thread details
    return {
      ...thread,
      comments: formattedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
