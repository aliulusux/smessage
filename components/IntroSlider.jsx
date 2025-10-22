"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function IntroSlider({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 400);
          return 100;
        }
        return p + 2.5;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl text-center shadow-xl w-[90%] sm:w-[460px]"
    >
      <motion.h1
        className="text-5xl sm:text-6xl font-extrabold mb-6 drop-shadow-md"
        animate={{
          textShadow: ["0 0 6px #fff", "0 0 20px #fff", "0 0 6px #fff"],
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
      >
        sMessage
      </motion.h1>

      <p className="text-purple-100 mb-4 text-base sm:text-lg">
        Welcome to the next-generation IRC chat
      </p>

      <div className="relative w-full bg-white/20 h-2 rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute top-0 left-0 h-full bg-white rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.05 }}
        />
      </div>

      <motion.p
        className="text-sm text-purple-200"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Slide to enter or click below to continue
      </motion.p>
    </motion.div>
  );
}
