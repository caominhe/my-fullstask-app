import AppRoutes from "./routes/AppRoutes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./theme/theme";
import { NotifyProvider } from "./contexts/NotifyContext";

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <NotifyProvider>
        <CssBaseline />
        <AppRoutes />
      </NotifyProvider>
    </ThemeProvider>
  );
}
export default App;