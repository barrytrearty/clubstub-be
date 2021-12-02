import createHttpError from "http-errors";

export const clubAdminOnlyMiddleware = (req, res, next) => {
  if (req.user.role === "Club Admin") {
    next();
  } else {
    next(createHttpError(403, "Club Admin Only!"));
  }
};

export const siteAdminOnlyMiddleware = (req, res, next) => {
  if (req.user.role === "Club Admin") {
    next();
  } else {
    next(createHttpError(403, "Club Admin Only!"));
  }
};
