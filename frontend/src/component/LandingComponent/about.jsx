"use client"

import { useEffect, useRef } from "react"
import { CheckCircle } from "lucide-react"

export default function About() {
  const aboutRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0")
            entry.target.classList.add("animate-fadeIn")
          }
        })
      },
      { threshold: 0.1 }
    )

    if (aboutRef.current) {
      observer.observe(aboutRef.current)
    }

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current)
      }
    }
  }, [])

  const benefits = [
    "Increase team productivity by up to 40%",
    "Reduce administrative task overhead",
    "Seamless integration with everyday tools",
    "Enterprise-grade security for your data",
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 mb-3">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* About Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-indigo-800/30 dark:to-purple-800/30 rounded-2xl -rotate-3 scale-[0.97]"></div>
              <img
                src="/asserts/team_collab.png"
                alt="About WebPro Toolkit"
                className="relative rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full hover:scale-105 transition-transform"
              />

              {/* Stats Card */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-400 flex items-center justify-center text-white font-bold">
                      +
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 gradient-text">87%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Productivity Increase</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Content */}
          <div ref={aboutRef} className="w-full lg:w-1/2 opacity-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/60 text-yellow-600 dark:text-yellow-300 text-sm font-medium mb-4 hover:scale-105 transition-transform">
              <span>About Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100 hover:text-indigo-500 transition-colors">
              We Help Teams <span className="gradient-text">Work Smarter</span>, Not Harder
            </h2>
            <p className="text-lg mb-8 max-w-3xl mx-auto text-gray-700 dark:text-gray-300 hover:text-indigo-400 transition-colors">
              We are passionate about providing innovative solutions that empower you to stay organized, connected, and productive. Our WebPro Toolkit combines modern technology and creative design to deliver a seamless experience.
            </p>
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                  <CheckCircle className="h-6 w-6 text-indigo-500 dark:text-indigo-300 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

