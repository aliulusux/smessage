import { motion } from "framer-motion"
import SliderGate from "../components/SliderGate.jsx"
import { useNavigate } from "react-router-dom"

export default function Intro(){
  const nav = useNavigate()
  return (
    <div className="container center" style={{flexDirection:"column", gap:28, height:"100%"}}>
      <motion.div
        initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} transition={{duration:.8}}
        className="glow" style={{fontSize:72, fontWeight:900, letterSpacing:2}}
      >
        sMessage
      </motion.div>

      <SliderGate onContinue={()=>nav("/join")}/>
    </div>
  )
}
