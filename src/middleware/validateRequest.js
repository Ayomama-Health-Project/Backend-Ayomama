import { ZodError } from "zod";
import { buildProblemType, sendProblem } from "../utils/problem.js";

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendProblem(res, req, {
          type: buildProblemType(req, "validation-error"),
          title: "Validation failed",
          status: 422,
          detail: "One or more fields are invalid.",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            code: issue.code,
            message: issue.message,
          })),
        });
      }

      return sendProblem(res, req, {
        type: buildProblemType(req, "validation-error"),
        title: "Validation failed",
        status: 422,
        detail: "Invalid request payload.",
      });
    }
  };
}
