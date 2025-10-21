import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { SettingsProvider } from "./context/SettingsContext.jsx"
import App from "./App.jsx"
import "./styles/globals.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App/>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
