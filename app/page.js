import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import IntroSlider from "@/components/IntroSlider";

export default function Home() {
  const router = useRouter();
  const [slideDone, setSlideDone] = useState(false);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
      {!slideDone ? (
        <IntroSlider onFinish={() => setSlideDone(true)} />
      ) : (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">sMessage</h1>
          <p className="mb-4 text-lg">
            Welcome to the next-generation IRC chat
          </p>
          <button
            onClick={() => router.push("/join")}
            className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-purple-100 transition"
          >
            Enter Chat
          </button>
        </motion.div>
      )}
    </div>
  );
}
