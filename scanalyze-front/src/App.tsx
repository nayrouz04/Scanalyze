import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routes";                        // ← via routes/index.ts
import { StepperProvider } from "./features/stepper/StepperContext";

/**
 * App — root component of the application.
 *
 * Responsibilities:
 *   - BrowserRouter  : enables client-side routing throughout the app
 *   - StepperProvider: provides global document pipeline stepper state
 *   - AppRouter      : renders all route definitions
 */
export default function App() {
 const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL as string;
  console.log('API_BASE_URL:', API_BASE_URL);
  return (
    <BrowserRouter>
      <StepperProvider>
        <AppRouter />
      </StepperProvider>
    </BrowserRouter>
  );
}