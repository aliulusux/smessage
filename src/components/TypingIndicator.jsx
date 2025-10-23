import React from "react";
import { motion } from "framer-motion";

export default function TypingIndicator() {
  const dotVariants = {
    start: { y: 0, opacity: 0.6 },
    end: (i) => ({
      y: [-3, 3, -3],
      opacity: [0.4, 1, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1.4,
        delay: i * 0.2,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <motion.div
      className="typing-glass"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          custom={i}
          variants={dotVariants}
          animate="end"
          initial="start"
        />
      ))}
    </motion.div>
  );
}
