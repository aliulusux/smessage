"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import IntroSlider from "@/components/IntroSlider";

export default function Home() {
  const router = useRouter();
  const [introDone, setIntroDone] = useState(false);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden">
      {!introDone ? (
        <IntroSlider onFinish={() => setIntroDone(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6"
        >
          <motion.h1
            className="text-6xl sm:text-7xl font-extrabold drop-shadow-lg mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            sMessage
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl mb-8 text-purple-100 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome to the next-generation IRC chat — where simplicity meets real-time.
          </motion.p>

          <motion.button
            onClick={() => router.push("/join")}
            className="bg-white text-purple-700 font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-purple-50 active:scale-95 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enter Chat
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
