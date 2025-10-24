import React from "react";
import "../styles.css";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, Eye } from "lucide-react";

function StatusIcon({ status }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 2, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -2, scale: 0.9 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="status-icon"
      >
        {status === "pending" && <Check className="icon pending" size={13} />}
        {status === "sent" && <Check className="icon sent" size={13} />}
        {status === "delivered" && (
          <CheckCheck className="icon delivered" size={13} />
        )}
        {status === "seen" && (
          <motion.div
            initial={{ opacity: 0.7, scale: 0.9 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [0.9, 1, 0.9],
              filter: [
                "drop-shadow(0 0 1px rgba(255,255,255,0.2))",
                "drop-shadow(0 0 3px rgba(0,255,255,0.6))",
                "drop-shadow(0 0 1px rgba(255,255,255,0.2))",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: "easeInOut",
            }}
          >
            <Eye className="icon seen-glow" size={13} />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function MessageBubble({ me, msg }) {
  const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`bubble-wrap ${me ? "me" : ""}`}>
      <motion.div
        className={`message-bubble ${me ? "me" : ""}`}
        initial={{ opacity: 0, y: 25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        {!me && <div className="sender">{msg.sender}</div>}

        <div className="body">{msg.body}</div>

        {/* bottom row for time + seen */}
        <div className="meta">
          <span className="time">{formattedTime}</span>
          {me && (
            <motion.div
              className="tick-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <StatusIcon status={msg.status || (msg.seen ? "seen" : "sent")} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
