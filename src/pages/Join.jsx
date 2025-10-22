import { useEffect, useState } from "react"
import ChannelList from "../components/ChannelList.jsx"
import CreateChannelModal from "../components/CreateChannelModal.jsx"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import GlassAlert from "../components/GlassAlert";

export default function Join(){
  const nav = useNavigate()
  const [username,setUsername] = useState(localStorage.getItem("username") || "")
  const [open,setOpen] = useState(false)
  const [loading,setLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(()=>{ 
    if(username.trim()) localStorage.setItem("username", username)
  },[username])

  const registerUser = async (name)=>{
    // Check if username exists
    const { data: exists } = await supabase.from("users")
      .select("id").eq("username", name).maybeSingle()
    if(exists){
      alert("This username is already taken. Please choose another one.")
      return false
    }

    // Insert new user
    const { error } = await supabase.from("users")
      .insert({ username: name })
    if(error){
      alert("Error creating user: " + error.message)
      return false
    }
    return true
  }

  const joinChannel = async (ch)=>{
    if(!username.trim()){ setAlertMessage("Please enter a username first."); return }

    setLoading(true)
    const ok = await registerUser(username.trim())
    if(!ok){ setLoading(false); return }

    if(ch.is_private){
      const pass = prompt("This channel is private. Enter password:")
      if(pass === null){ setLoading(false); return }
      if(pass !== ch.password){ alert("Wrong password"); setLoading(false); return }
    }

    setLoading(false)
    nav(`/chat/${ch.id}`)
  }

  return (
    {alertMessage && (
      <GlassAlert message={alertMessage} onClose={() => setAlertMessage("")} />
    )}
    <div className="container" style={{maxWidth:920}}>
      <div className="card">
        <h1 style={{marginTop:0, textAlign:"center"}}>Join sMessage</h1>
        <p style={{textAlign:"center", opacity:.85}}>Enter your username and select a channel to start chatting</p>

        <div className="col" style={{marginTop:18}}>
          <label>Username</label>
          <input className="input" placeholder="Enter your username"
                 value={username} onChange={e=>setUsername(e.target.value)} />
        </div>

        <div className="row" style={{justifyContent:"space-between", marginTop:14}}>
          <div style={{opacity:.9}}>Available Channels</div>
          <button className="btn" onClick={()=>setOpen(true)}>Create Channel</button>
        </div>

        <div style={{marginTop:12}}>
          <ChannelList onJoin={(c)=>!loading && joinChannel(c)}/>
        </div>
      </div>

      <CreateChannelModal open={open} onClose={()=>setOpen(false)}/>
    </div>
  )
}
