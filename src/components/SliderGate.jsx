import { useState } from "react"

export default function SliderGate({ onContinue }){
  const [pos,setPos] = useState(0)

  const handleClick = ()=> onContinue?.()

  return (
    <div className="card" style={{maxWidth:620, margin:"0 auto"}}>
      <h3 className="glow" style={{marginTop:0, textAlign:"center"}}>
        Welcome to the next-generation IRC chat
      </h3>
      <p style={{textAlign:"center",opacity:.9,marginTop:8}}>
        Slide to enter or click below to continue
      </p>

      <div style={{marginTop:18}}>
        <input
          type="range"
          min="0" max="100" value={pos}
          onChange={e=>{
            const v = Number(e.target.value)
            setPos(v)
            if(v===100) onContinue?.()
          }}
          style={{width:"100%"}}
        />
      </div>

      <div style={{marginTop:16, display:"flex", justifyContent:"center"}}>
        <button className="btn" onClick={handleClick}>Enter Chat</button>
      </div>
    </div>
  )
}
