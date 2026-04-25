
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { StepperProvider } from "./features/stepper/StepperContext";

export default function App() {
  return (
    <BrowserRouter>
      <StepperProvider>
        <AppRouter />
      </StepperProvider>
    </BrowserRouter>
  );
}