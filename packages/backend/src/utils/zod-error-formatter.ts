import { ZodError, ZodIssue } from "zod";
import type { ErrorResponse } from "../types";

export interface FormattedZodError {
  field: string;
  message: string;
}

export function formatZodError(error: ZodError): {
  message: string;
  fields: FormattedZodError[];
} {
  const fields: FormattedZodError[] = error.issues.map((issue: ZodIssue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

  // Create a user-friendly summary message
  const fieldCount = fields.length;
  const fieldNames = fields.map((f) => f.field).join(", ");

  let summaryMessage: string;
  if (fieldCount === 1) {
    summaryMessage = `Validation failed for ${fieldNames}: ${fields[0].message}`;
  } else {
    summaryMessage = `Validation failed for ${fieldCount} fields: ${fieldNames}`;
  }

  return {
    message: summaryMessage,
    fields,
  };
}

export function createZodErrorResponse(error: ZodError): ErrorResponse {
  const formatted = formatZodError(error);

  return {
    success: false,
    message: formatted.message,
    isFormError: true,
    // Add the detailed field errors as additional data
    ...(formatted.fields.length > 0 && {
      errors: formatted.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.field]: field.message,
        }),
        {},
      ),
    }),
  };
}
