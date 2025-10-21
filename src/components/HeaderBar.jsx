import Logo from "./Logo.jsx"

export default function HeaderBar({ onSettings, onLogout }){
  return (
    <div className="row" style={{
      alignItems:"center", justifyContent:"space-between",
      padding:"16px 0", width:"100%"
    }}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <img src="/src/assets/smessage.svg" alt="sMessage" height="42"/>
        <div className="glow" style={{fontWeight:800, fontSize:24}}>sMessage</div>
      </div>

      <div className="row" style={{gap:10}}>
        <button className="btn" onClick={onSettings}>Settings</button>
        <button className="btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}
