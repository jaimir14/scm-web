import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import LandingApp from "./LandingApp.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.MODE === "landing") {
  root.render(<LandingApp />);
} else {
  root.render(<App />);
}
