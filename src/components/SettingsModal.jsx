import { useSettings } from "../context/SettingsContext"

export default function SettingsModal({ open, onClose }){
  const { theme, setTheme, THEMES, fontFamily, setFontFamily, FONTS, fontSize, setFontSize } = useSettings()
  if(!open) return null

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:60
    }}>
      <div className="card" style={{width:520}}>
        <div className="row" style={{justifyContent:"space-between"}}>
          <h3 style={{margin:0}}>Settings</h3>
          <button className="btn" onClick={onClose}>×</button>
        </div>

        <div className="col" style={{marginTop:12}}>
          <label>Font size (16px–24px)</label>
          <input type="range" min="16" max="24" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/>
          <div>{fontSize}px</div>
        </div>

        <div className="col" style={{marginTop:12}}>
          <label>Font family</label>
          <select className="input" value={fontFamily} onChange={e=>setFontFamily(e.target.value)}>
            {FONTS.map(f=><option key={f} value={f}>{f.split(",")[0]}</option>)}
          </select>
        </div>

        <div className="col" style={{marginTop:12}}>
          <label>Theme</label>
          <select className="input" value={theme} onChange={e=>setTheme(e.target.value)}>
            {THEMES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
