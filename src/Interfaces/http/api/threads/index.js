import express from 'express';
import ThreadsHandler from './handler.js';
import routeDefinitions from './routes.js';

const threads = (container, authenticate) => {
  const router = express.Router();
  const handler = new ThreadsHandler(container);
  const routeDefs = routeDefinitions(handler, authenticate);

  routeDefs.forEach(({ method, path, handler: routeHandler, auth }) => {
    const middlewares = auth ? [authenticate] : [];
    router[method.toLowerCase()](path, ...middlewares, routeHandler);
  });

  return router;
};

export default threads;
