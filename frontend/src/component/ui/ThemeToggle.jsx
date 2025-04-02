import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../providers/ThemeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`relative ${className} overflow-hidden`}
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
