import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleSupabaseError(error: any): never {
  console.error("Supabase error:", error);

  const message = error?.message || "An unexpected error occurred";
  const code = error?.code;

  // Map common Supabase error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    "23505": "This record already exists",
    "23503": "Cannot delete - this record is referenced by other data",
    "42501": "You don't have permission to perform this action",
    PGRST116: "Record not found",
    "22P02": "Invalid data format",
  };

  const userMessage = code && errorMessages[code] ? errorMessages[code] : message;

  throw new ApiError(userMessage, 400, code);
}

export function showErrorToast(error: unknown, fallbackMessage = "Something went wrong") {
  const message = error instanceof Error ? error.message : fallbackMessage;
  toast.error(message);
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showInfoToast(message: string) {
  toast.info(message);
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage = "An error occurred"
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage, error);
    showErrorToast(error, errorMessage);
    return null;
  }
}
