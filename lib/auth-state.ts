export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    identifier?: string;
    password?: string;
  };
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};