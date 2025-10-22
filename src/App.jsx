import React, { useEffect, useMemo, useState } from "react";
import Intro from "./components/Intro.jsx";
import SliderGate from "./components/SliderGate.jsx";
import Join from "./components/Join.jsx";
import Chat from "./components/Chat.jsx";
import { settings } from "./state/settingsStore.js";
import { themes } from "./utils/themes.js";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";

export default function App() {
  const [step, setStep] = useState("intro"); // intro -> gate -> join -> chat
  const [username, setUsername] = useState(localStorage.getItem("smessage:username") || "");
  const [activeChannel, setActiveChannel] = useState(null);

  // apply theme & font size/family to body
  const s = settings.use();
  useEffect(() => {
    document.body.dataset.theme = s.theme;
    document.body.style.setProperty("--app-font-size", `${s.fontSize}px`);
    document.body.style.setProperty("--app-font-family", s.fontFamily);
  }, [s.theme, s.fontSize, s.fontFamily]);

  useEffect(() => {
    if (username) localStorage.setItem("smessage:username", username);
  }, [username]);

  return (
    <div className="app-wrap">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div key="intro" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <Intro onDone={() => setStep("gate")} />
          </motion.div>
        )}
        {step === "gate" && (
          <motion.div key="gate" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
            <SliderGate onEnter={() => setStep("join")} />
          </motion.div>
        )}
        {step === "join" && (
          <motion.div key="join" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
            <Join
              username={username}
              setUsername={setUsername}
              onJoin={(channel) => { setActiveChannel(channel); setStep("chat"); }}
            />
          </motion.div>
        )}
        {step === "chat" && activeChannel && (
          <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <Chat
              username={username}
              channel={activeChannel}
              onBack={() => setStep("join")}
              onLogout={() => { setUsername(""); localStorage.removeItem("smessage:username"); setStep("join"); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
