import { createContext, useContext, useMemo, useState, useEffect } from "react"

const SettingsContext = createContext(null)

const THEMES = [
  "sunset","neon","dark","light","amethyst",
  "pastel","iced","forest","candy","slate"
]
const FONTS = [
  "Inter, ui-sans-serif, system-ui",
  "DM Sans, ui-sans-serif, system-ui",
  "Poppins, ui-sans-serif, system-ui",
  "Rubik, ui-sans-serif, system-ui",
  "Nunito, ui-sans-serif, system-ui",
  "Sora, ui-sans-serif, system-ui"
]

export function SettingsProvider({ children }){
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "pastel")
  const [fontFamily, setFontFamily] = useState(localStorage.getItem("fontFamily") || FONTS[0])
  const [fontSize, setFontSize] = useState(Number(localStorage.getItem("fontSize") || 16))

  useEffect(()=>{
    localStorage.setItem("theme", theme)
    localStorage.setItem("fontFamily", fontFamily)
    localStorage.setItem("fontSize", String(fontSize))

    const body = document.body
    if(theme === "dark") body.style.background = "var(--theme-dark)"
    else if(theme === "light") body.style.background = "var(--theme-light)"
    else body.style.background = `var(--theme-${theme})`

    body.style.color = theme === "light" ? "#0f1020" : "#fff"
    body.style.fontFamily = fontFamily
    body.style.fontSize = `${fontSize}px`
  },[theme,fontFamily,fontSize])

  const value = useMemo(()=>({
    theme, setTheme, fontFamily, setFontFamily, fontSize, setFontSize, THEMES, FONTS
  }),[theme,fontFamily,fontSize])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
