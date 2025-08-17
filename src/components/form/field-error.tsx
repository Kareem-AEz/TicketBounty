import { ActionState } from "./utils/to-action-state";

type FieldErrorProps = {
  actionState: ActionState;
  name: string;
};

export const FieldError = ({ actionState, name }: FieldErrorProps) => {
  const errorMessages = actionState.fieldErrors?.[name];

  if (!errorMessages) return null;

  return (
    <div className="text-destructive flex flex-col gap-y-1 text-xs">
      {errorMessages.map((error) => (
        <span key={error}>{error}</span>
      ))}
    </div>
  );
};
