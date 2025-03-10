"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import ThemeToggle from "../common/ThemeToggle"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
          <div className="text-xl font-bold">
            <Link to="/" className="flex items-center gap-1 text-gray-800 dark:text-gray-100 hover:text-indigo-600 transition-colors">
              <span className="text-indigo-600 dark:text-indigo-400">Toolverse</span> Toolkit
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <Link to="/" className="nav-link hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link to="/about" className="nav-link hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link to="/features" className="nav-link hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link to="/help" className="nav-link hover:text-indigo-600 transition-colors">
              Help
            </Link>
          </div>
          <div className="flex items-center gap-4">
    
            <Link
              to="/login"
              className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors rounded-md"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors rounded-md shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="md:hidden flex items-center gap-4">

          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 py-5 px-4 flex flex-col items-start gap-5 animate-fadeIn">
          <Link onClick={toggleMenu} to="/" className="nav-link w-full hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <Link onClick={toggleMenu} to="/about" className="nav-link w-full hover:text-indigo-600 transition-colors">
            About
          </Link>
          <Link onClick={toggleMenu} to="/features" className="nav-link w-full hover:text-indigo-600 transition-colors">
            Features
          </Link>
          <Link onClick={toggleMenu} to="/help" className="nav-link w-full hover:text-indigo-600 transition-colors">
            Help
          </Link>
          <div className="flex flex-col w-full gap-3 pt-2">
            <Link
              onClick={toggleMenu}
              to="/login"
              className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors rounded-md text-center"
            >
              Login
            </Link>
            <Link
              onClick={toggleMenu}
              to="/register"
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors rounded-md shadow-sm text-center"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

