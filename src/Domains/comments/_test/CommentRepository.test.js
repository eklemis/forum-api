const CommentRepository = require("../CommentRepository");

describe("CommentRepository interface", () => {
  const abstractMethods = [
    { methodName: "addComment", args: ["threadId", "content", "owner"] },
    { methodName: "deleteCommentById", args: ["commentId"] },
    { methodName: "verifyCommentExists", args: ["commentId"] },
    { methodName: "getCommentOwner", args: ["commentId"] },
    { methodName: "getCommentsByThreadId", args: ["threadId"] },
  ];

  it.each(abstractMethods)(
    "should throw error when invoking abstract method $methodName",
    async ({ methodName, args }) => {
      // Arrange
      const commentRepository = new CommentRepository();

      // Action & Assert
      await expect(commentRepository[methodName](...args)).rejects.toThrowError(
        "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED",
      );
    },
  );
});
