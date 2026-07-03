function buildProblemType(req, path = "server-error") {
  const host = req.get("host");
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${protocol}://${host}/problems/${path}`;
}

function normalizeProblemType(req, type) {
  if (!type) {
    return buildProblemType(req, "server-error");
  }

  const veridomMatch = type.match(/\/problems\/([^/?#]+)/);
  if (veridomMatch) {
    return buildProblemType(req, veridomMatch[1]);
  }

  if (type.startsWith("/problems/")) {
    return buildProblemType(req, type.replace("/problems/", ""));
  }

  return type;
}

export function sendProblem(res, req, options) {
  const {
    type = buildProblemType(req, "server-error"),
    title = "Request failed",
    status = 500,
    detail = "The request could not be completed.",
    errors = [],
  } = options;

  return res.status(status).json({
    type: normalizeProblemType(req, type),
    title,
    status,
    detail,
    instance: req.originalUrl,
    errors,
  });
}

export { buildProblemType };

export function sendSuccess(res, options = {}) {
  const {
    status = 200,
    message = "Request completed successfully",
    data = null,
    meta,
  } = options;

  return res.status(status).json({
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}
