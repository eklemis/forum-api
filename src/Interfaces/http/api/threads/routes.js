const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: "jwt", // JWT authentication enabled
    },
  },
];

module.exports = routes;
