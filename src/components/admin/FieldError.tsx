/** The message under a form field that failed validation. */
export const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs font-medium text-destructive">{message}</p> : null;

export default FieldError;
