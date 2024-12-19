const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: "jwt", // JWT authentication enabled
    },
  },
  {
    method: "POST",
    path: "/threads/{threadId}/comments",
    handler: handler.postCommentHandler,
    options: {
      auth: "jwt",
    },
  },
  {
    method: "DELETE",
    path: "/threads/{threadId}/comments/{commentId}",
    handler: handler.deleteCommentHandler,
    options: {
      auth: "jwt",
    },
  },
  {
    method: "GET",
    path: "/threads/{threadId}",
    handler: handler.getThreadDetailHandler,
  },
  {
    method: "POST",
    path: "/threads/{threadId}/comments/{commentId}/replies",
    handler: handler.postReplyHandler, // Add this route
    options: {
      auth: "jwt",
    },
  },
  {
    method: "DELETE",
    path: "/threads/{threadId}/comments/{commentId}/replies/{replyId}",
    handler: handler.deleteReplyHandler,
    options: {
      auth: "jwt",
    },
  },
];

module.exports = routes;
