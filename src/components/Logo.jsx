export default function Logo({ size=64 }){
  return (
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <img src="/src/assets/smessage.svg" alt="sMessage" height={size}/>
      <span className="glow" style={{fontWeight:700,fontSize: size/2}}>sMessage</span>
    </div>
  )
}
