import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function Intro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="intro">
      <motion.img
        src="/smessage.svg"
        alt="sMessage"
        className="intro-logo"
        initial={{ scale: 0.6, filter: "blur(8px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <motion.h1
        className="intro-title"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, textShadow: "0 0 32px rgba(167,139,250,0.8)" }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        sMessage
      </motion.h1>
    </div>
  );
}
