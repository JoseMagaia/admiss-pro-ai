var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    inputValidator: (inputValidator) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { inputValidator }));
    },
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server }));
    }
  };
};
const ACTIVE_SPACE_KEY = "activeSpaceId";
const attachActiveSpace = createMiddleware({ type: "function" }).client(async ({ next }) => {
  let spaceId = null;
  try {
    if (typeof window !== "undefined") {
      spaceId = window.localStorage.getItem(ACTIVE_SPACE_KEY);
    }
  } catch {
    spaceId = null;
  }
  return next({
    headers: spaceId ? { "x-space-id": spaceId } : {}
  });
});
export {
  ACTIVE_SPACE_KEY as A,
  attachActiveSpace as a,
  createMiddleware as c
};
