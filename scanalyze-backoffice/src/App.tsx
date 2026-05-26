import { BrowserRouter } from "react-router-dom";
import { Provider }      from "react-redux";
import { store }         from "./app/store";
import { AppRouter }     from "./routes";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Provider>
  );
}