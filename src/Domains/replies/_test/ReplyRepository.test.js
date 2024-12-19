const ReplyRepository = require("../ReplyRepository");

describe("ReplyRepository interface", () => {
  const abstractMethods = [
    { methodName: "addReply", args: ["commentId", "content", "owner"] },
    { methodName: "deleteReplyById", args: ["replyId"] },
    { methodName: "getRepliesByCommentId", args: ["commentId"] },
    { methodName: "verifyReplyExists", args: ["replyId"] },
    { methodName: "getReplyOwner", args: ["replyId"] },
    { methodName: "verifyReplyOwnership", args: ["replyId,", "owner"] },
  ];

  it.each(abstractMethods)(
    "should throw error when invoking abstract method $methodName",
    async ({ methodName, args }) => {
      // Arrange
      const replyRepository = new ReplyRepository();

      // Action & Assert
      await expect(replyRepository[methodName](...args)).rejects.toThrowError(
        "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED",
      );
    },
  );
});
