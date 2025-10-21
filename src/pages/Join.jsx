import { useEffect, useState } from "react"
import ChannelList from "../components/ChannelList.jsx"
import CreateChannelModal from "../components/CreateChannelModal.jsx"
import { useNavigate } from "react-router-dom"

export default function Join(){
  const nav = useNavigate()
  const [username,setUsername] = useState(localStorage.getItem("username") || "")
  const [open,setOpen] = useState(false)

  useEffect(()=>{ localStorage.setItem("username", username) },[username])

  const joinChannel = async (ch)=>{
    if(ch.is_private){
      const pass = prompt("This channel is private. Enter password:")
      if(pass === null) return
      if(pass !== ch.password){ alert("Wrong password"); return }
    }
    nav(`/chat/${ch.id}`)
  }

  return (
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
          <ChannelList onJoin={(c)=>{
            if(!username.trim()){ alert("Please enter a username first."); return }
            joinChannel(c)
          }}/>
        </div>
      </div>

      <CreateChannelModal open={open} onClose={()=>setOpen(false)}/>
    </div>
  )
}
