"use client"

import React from "react"

export function Tabs({ children, defaultValue = "" }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <div data-active-tab={activeTab}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { activeTab, setActiveTab })
          : child
      )}
    </div>
  )
}

export function TabsList({ children }) {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1">
      {children}
    </div>
  )
}

export function TabsTrigger({ value, activeTab, setActiveTab, children }) {
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        activeTab === value ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, activeTab, children }) {
  return activeTab === value ? <div className="mt-2">{children}</div> : null
}