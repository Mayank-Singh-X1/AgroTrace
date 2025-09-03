import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BlockchainProvider } from "./context/BlockchainContext";

createRoot(document.getElementById("root")!).render(
  <BlockchainProvider>
    <App />
  </BlockchainProvider>
);
