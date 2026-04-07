import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotifyContext = createContext(null);

export function NotifyProvider({ children }) {
  const [state, setState] = useState({ open: false, message: "", severity: "info" });

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const show = useCallback((message, severity = "info") => {
    setState({ open: true, message, severity });
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      info: (message) => show(message, "info"),
      warning: (message) => show(message, "warning"),
    }),
    [show]
  );

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={6000}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={close} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
          {state.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) {
    throw new Error("useNotify must be used within NotifyProvider");
  }
  return ctx;
}
