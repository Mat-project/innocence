import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "theme" }) {
  const [theme, setTheme] = useState(() => {
    // Get from local storage or use default
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme) return storedTheme;

    // Check system preference
    if (defaultTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Listen for system preference changes
  useEffect(() => {
    if (defaultTheme !== "system") return;

    function handleSystemThemeChange(event) {
      const newTheme = event.matches ? "dark" : "light";
      setTheme(newTheme);
    }

    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    matcher.addEventListener("change", handleSystemThemeChange);
    return () => {
      matcher.removeEventListener("change", handleSystemThemeChange);
    };
  }, [defaultTheme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme === "system" 
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : newTheme
      );
    },
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
