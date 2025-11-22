export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
  success: false;
  message: string;
  isFormError?: boolean;
  errors?: Record<string, string>; // Add field-level errors
};

// Additional types for better error handling
export interface ValidationError {
  field: string;
  message: string;
}
