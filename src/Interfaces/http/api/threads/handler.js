const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase"); // Add this line
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const GetThreadDetailUseCase = require("../../../../Applications/use_case/GetThreadDetailUseCase");
const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      title,
      body,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );
    const addedComment = await addCommentUseCase.execute({
      threadId,
      content,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    await deleteCommentUseCase.execute({ threadId, commentId, owner });

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
  async getThreadDetailHandler(request, h) {
    const { threadId } = request.params;

    const getThreadDetailUseCase = this._container.getInstance(
      GetThreadDetailUseCase.name,
    );

    const thread = await getThreadDetailUseCase.execute({ threadId });

    return h
      .response({
        status: "success",
        data: { thread },
      })
      .code(200);
  }
  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      threadId,
      commentId,
      content,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }
  async deleteReplyHandler(request, h) {
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );

    await deleteReplyUseCase.execute({ threadId, commentId, replyId, owner });

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
