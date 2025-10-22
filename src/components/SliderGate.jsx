import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SliderGate({ onEnter }) {
  const [v, setV] = useState(0);

  const handleClick = () => onEnter();
  const handleSlide = (e) => {
    const val = Number(e.target.value);
    setV(val);
    if (val >= 100) onEnter();
  };

  return (
    <div className="gate">
      <motion.div className="gate-card" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <h2>Welcome to the next-generation IRC chat</h2>
        <p>Slide to enter or click below to continue</p>
        <input type="range" min="0" max="100" value={v} onChange={handleSlide} />
        <button onClick={handleClick}>Enter Chat</button>
      </motion.div>
    </div>
  );
}
