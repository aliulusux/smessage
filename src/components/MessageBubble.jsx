import React from "react";
import "../styles.css";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, Eye } from "lucide-react";

function StatusIcon({ status }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "pending" && (
        <motion.div
          key="pending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="status-icon"
        >
          <Check className="icon pending" size={13} />
        </motion.div>
      )}

      {status === "sent" && (
        <motion.div
          key="sent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="status-icon"
        >
          <Check className="icon sent" size={13} />
        </motion.div>
      )}

      {status === "delivered" && (
        <motion.div
          key="delivered"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="status-icon"
        >
          <CheckCheck className="icon delivered" size={13} />
        </motion.div>
      )}

      {status === "seen" && (
        <motion.div
          key="seen"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            scale: [0.95, 1, 0.95],
            filter: [
              "drop-shadow(0 0 0px rgba(64,224,208,0.3))",
              "drop-shadow(0 0 5px rgba(64,224,208,0.7))",
              "drop-shadow(0 0 0px rgba(64,224,208,0.3))",
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="status-icon"
        >
          <Eye className="icon seen-glow" size={13} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MessageBubble({ me, msg }) {
  // ✅ Defensive fallback
  if (!msg) return null;

  const safeTime = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const formattedTime = safeTime || "--:--";
  const body = msg.body || "";
  const sender = msg.sender || "Unknown";

  const effectiveStatus =
    msg.status || (msg.seen ? "seen" : msg.delivered ? "delivered" : "sent");

  return (
    <div className={`bubble-wrap ${me ? "me" : ""}`}>
      <motion.div
        className={`message-bubble ${me ? "me" : ""}`}
        initial={{ opacity: 0, y: 25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        {!me && <div className="sender">{sender}</div>}

        <div className="body">{body}</div>

        <div className="meta">
          <span className="time">{formattedTime}</span>
          {me && (
            <motion.div
              className="tick-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <StatusIcon status={effectiveStatus} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
