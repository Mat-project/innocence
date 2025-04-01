"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react"

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef(null)

  const images = [
    { src: "/asserts/Hero.gif", alt: "Workspace Dashboard" },
    { src: "/asserts/hero2.png", alt: "Team Collaboration" },
    { src: "/asserts/hero3.png", alt: "Productivity Tools" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  useEffect(() => {
    setIsVisible(true)
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => heroRef.current && observer.unobserve(heroRef.current)
  }, [])

  return (
    <section ref={heroRef} className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="container px-4 mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div
          className={`w-full lg:w-1/2 space-y-8 transition-all duration-700 ${
            isVisible ? "animate-fadeIn" : "opacity-0"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-sm font-medium">
            <Sparkles size={16} className="text-purple-500" />
            <span>Boost your productivity</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            Your Ultimate <span className="gradient-text">Workspace</span> for Seamless Productivity
          </h1>
          <p className="text-lg md:text-xl max-w-xl text-gray-600 dark:text-gray-300">
            A powerful all-in-one workspace designed for individuals and teams to streamline tasks, collaborate seamlessly, and maximize productivity – all in one place.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-sm flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/demo"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 group"
            >
              Watch Demo
              <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        <div
          className={`w-full lg:w-1/2 relative transition-all duration-700 ${
            isVisible ? "animate-slideInRight" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative aspect-[4/3] w-full max-w-xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 dark:from-indigo-800/30 dark:to-blue-800/30 rounded-2xl -rotate-2 scale-[0.97] animate-pulse" style={{ animationDuration: "4s" }}></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 dark:from-purple-800/30 dark:to-pink-800/30 rounded-2xl rotate-2 scale-[0.97] animate-pulse" style={{ animationDuration: "5s" }}></div>
            <div className="relative h-full w-full rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
            <div className="absolute -top-6 -right-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Productivity
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-float" style={{ animationDelay: "1s", animationDuration: "5s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  ✓
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

