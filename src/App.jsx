import { Routes, Route, Navigate } from "react-router-dom"
import Intro from "./pages/Intro.jsx"
import Join from "./pages/Join.jsx"
import Chat from "./pages/Chat.jsx"

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Intro/>}/>
      <Route path="/join" element={<Join/>}/>
      <Route path="/chat/:channelId" element={<Chat/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}
