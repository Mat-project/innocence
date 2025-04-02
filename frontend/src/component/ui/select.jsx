import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const SelectContext = createContext()

export function Select({ children, value, onValueChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const contextValue = { value, onValueChange, open, setOpen, disabled }

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={ref} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function useSelectContext() {
  const context = useContext(SelectContext)
  if (!context) throw new Error("Select components must be used within a Select")
  return context
}

export function SelectTrigger({ children, ...props }) {
  const { open, setOpen, disabled } = useSelectContext()
  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md border ${
        disabled ? "bg-muted opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent"
      }`}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  )
}

export function SelectValue({ placeholder }) {
  const { value } = useSelectContext()
  // Only consider undefined or null as missing value, so "" is a valid selection.
  const isValueMissing = value === undefined || value === null
  const displayValue = isValueMissing ? placeholder : value
  return <span className={isValueMissing ? "text-muted-foreground" : ""}>{displayValue}</span>
}

export function SelectContent({ children }) {
  const { open } = useSelectContext()
  if (!open) return null
  return (
    <div className="absolute top-full left-0 w-full z-50 mt-1 rounded-md border bg-popover shadow-md outline-none">
      <ul className="py-1 max-h-[300px] overflow-auto" role="listbox">
        {children}
      </ul>
    </div>
  )
}

export function SelectItem({ children, value }) {
  const { onValueChange, setOpen } = useSelectContext()
  const handleSelect = () => {
    onValueChange(value)
    setOpen(false)
  }
  return (
    <li
      role="option"
      className="px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent outline-none"
      onClick={handleSelect}
      onKeyDown={(e) => e.key === "Enter" && handleSelect()}
      tabIndex={0}
    >
      {children}
    </li>
  )
}
