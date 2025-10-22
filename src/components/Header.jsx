import React from "react";
import { settings } from "../state/settingsStore";
import SettingsModal from "./SettingsModal";

export default function Header({ onBack, onLogout }) {
  const s = settings.use();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="header">
      <div className="left" onClick={onBack}>
        <img src="/smessage.svg" alt="logo" />
        <strong>sMessage</strong>
      </div>
      <div className="right">
        <button onClick={()=>setOpen(true)}>Settings</button>
        <button className="outline" onClick={onLogout}>Logout</button>
      </div>
      <SettingsModal open={open} onClose={()=>setOpen(false)} />
    </header>
  );
}
