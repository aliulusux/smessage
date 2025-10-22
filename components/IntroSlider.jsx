"use client";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function IntroSlider({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col items-center">
      <motion.h1
        className="text-6xl font-extrabold text-white drop-shadow-lg mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        sMessage
      </motion.h1>
      <motion.div
        className="w-64 h-2 bg-white/30 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "16rem" }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3 }}
        />
      </motion.div>
      <p className="mt-4 text-white text-sm">Loading...</p>
    </div>
  );
}
