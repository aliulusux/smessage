import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function CreateChannelModal({ open, onClose }){
  const [name,setName] = useState("")
  const [isPrivate,setIsPrivate] = useState(true)
  const [password,setPassword] = useState("")
  const [busy,setBusy] = useState(false)
  if(!open) return null

  const create = async ()=>{
    setBusy(true)
    const { error } = await supabase.from("channels").insert({
      name, is_private: isPrivate, password: isPrivate ? password : null
    })
    setBusy(false)
    if(error) alert(error.message)
    else{
      setName(""); setPassword(""); setIsPrivate(true);
      onClose?.()
    }
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:50
    }}>
      <div className="card" style={{width:560}}>
        <div className="row" style={{justifyContent:"space-between"}}>
          <h3 style={{margin:0}}>Create New Channel</h3>
          <button className="btn" onClick={onClose}>×</button>
        </div>

        <div className="col" style={{marginTop:12}}>
          <label>Channel Name</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter channel name" />
        </div>

        <div className="row" style={{marginTop:12}}>
          <label style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)}/>
            Private Channel (Password Protected)
          </label>
        </div>

        {isPrivate && (
          <div className="col" style={{marginTop:12}}>
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" />
          </div>
        )}

        <div className="row" style={{justifyContent:"flex-end", marginTop:16}}>
          <button className="btn" disabled={!name || (isPrivate && !password) || busy} onClick={create}>
            {busy ? "Creating…" : "Create Channel"}
          </button>
        </div>
      </div>
    </div>
  )
}
