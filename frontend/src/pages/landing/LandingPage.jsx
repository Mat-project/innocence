"use client"

import { useEffect } from "react"
import Navbar from "../../component/LandingComponent/Navbar"
import Hero from "../../component/LandingComponent/Hero"
import About from "../../component/LandingComponent/about"
import Features from "../../component/LandingComponent/Features"
//import Testimonials from "../../component/LandingComponent/testimonials"
import Contact from "../../component/LandingComponent/contact"
import Footer from "../../component/LandingComponent/Footer"

export default function LandingPage() {
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="w-screen flex flex-col flex-grow justify-center items-center">
        <Hero />
        <About />
        <Features />
        {/* <Testimonials /> */}
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

