import { useEffect, useState, createContext, useContext } from "react"

type Theme = "system" | "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  toggleTheme: () => { }
});

export function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("wave_theme") || "system") as Theme;
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  useEffect(() => {
    localStorage.setItem("wave_theme", theme);
    document.documentElement.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
      document.documentElement.classList.add(systemTheme)
      return
    }

    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
