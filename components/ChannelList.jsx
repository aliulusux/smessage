"use client";
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function ChannelList({ onJoin }){
  const [channels,setChannels] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      const { data, error } = await supabase.from("channels")
        .select("id,name,is_private,password")
        .order("created_at",{ ascending: false })
      if(!mounted) return
      if(error) setError(error.message)
      else setChannels(data || [])
      setLoading(false)
    })()

    const sub = supabase
      .channel("channels-changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        (p)=>{
          setChannels((prev)=>{
            const copy = [...prev]
            if(p.eventType === "INSERT") return [p.new, ...copy]
            if(p.eventType === "UPDATE") return copy.map(c => c.id===p.new.id ? p.new : c)
            if(p.eventType === "DELETE") return copy.filter(c => c.id!==p.old.id)
            return copy
          })
        })
      .subscribe()

    return ()=> { supabase.removeChannel(sub); mounted = false }
  },[])

  if(loading) return <div className="card">Loading channels…</div>
  if(error) return <div className="card">Error: {error}</div>

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Available Channels</h3>
      <div className="col">
        {channels.map(c=>{
          const lock = c.is_private ? " 🔒" : ""
          return (
            <div key={c.id} className="row" style={{justifyContent:"space-between", background:"rgba(255,255,255,.05)", borderRadius:12, padding:12}}>
              <div>
                <div style={{fontWeight:600}}>{c.name}{lock}</div>
                <div style={{opacity:.8,fontSize:13}}>id: {c.id.slice(0,8)}…</div>
              </div>
              <button className="btn" onClick={()=>onJoin(c)}>Join</button>
            </div>
          )
        })}
        {channels.length===0 && <div>No channels yet. Create one!</div>}
      </div>
    </div>
  )
}
