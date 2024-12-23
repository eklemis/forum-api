const Comment = require("../../Domains/comments/entities/Comment");
const Reply = require("../../Domains/replies/entities/Reply");

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
    const rawComments =
      await this._commentRepository.getCommentsByThreadId(threadId);

    // Map raw comments to Comment entities
    const formattedComments = rawComments.map(
      (comment) => new Comment(comment),
    );

    // Attach replies to each comment
    for (const comment of formattedComments) {
      const rawReplies = await this._replyRepository.getRepliesByCommentId(
        comment.id,
      );
      const replies = rawReplies.map((reply) => new Reply(reply));
      comment.replies = replies;
    }

    // Return the complete thread details
    return {
      ...thread,
      comments: formattedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
