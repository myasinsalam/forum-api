const routes = (handler, authenticate) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    auth: true,
  },
  {
    method: 'GET',
    path: '/threads/:threadId',
    handler: handler.getThreadDetailHandler,
    auth: false,
  },
  {
    method: 'POST',
    path: '/threads/:threadId/comments',
    handler: handler.postCommentHandler,
    auth: true,
  },
  {
    method: 'DELETE',
    path: '/threads/:threadId/comments/:commentId',
    handler: handler.deleteCommentHandler,
    auth: true,
  },
  {
    method: 'POST',
    path: '/threads/:threadId/comments/:commentId/replies',
    handler: handler.postReplyHandler,
    auth: true,
  },
  {
    method: 'DELETE',
    path: '/threads/:threadId/comments/:commentId/replies/:replyId',
    handler: handler.deleteReplyHandler,
    auth: true,
  },
];

export default routes;
