"use client"

import { useEffect, useRef } from "react"
import { Mail, MessageSquare, Phone } from "lucide-react"

export default function Contact() {
  const contactRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn")
            entry.target.classList.remove("opacity-0")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    if (contactRef.current) observer.observe(contactRef.current)
    return () => {
      if (contactRef.current) observer.unobserve(contactRef.current)
    }
  }, [])

  return (
    <section className="contact-gradient py-20 w-full">
      <div className="container px-4 mx-auto">
        <div ref={contactRef} className="max-w-3xl mx-auto text-center opacity-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 text-sm font-medium mb-4 hover:scale-105 transition-transform">
            <span>Get In Touch</span>
          </div>
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100 hover:text-blue-500 transition-colors">
            Ready to <span className="gradient-text">Transform</span> Your Workflow?
          </h2>
          {/* Description */}
          <p className="text-lg mb-10 max-w-2xl mx-auto text-gray-700 dark:text-gray-300 hover:text-blue-400 transition-colors">
            Our experts are here to help you achieve your goals. Contact us to learn how we can support your success.
          </p>
          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Email */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 hover:text-indigo-500 transition-colors">
                Email Us
              </h3>
              <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                Response within 24 hours
              </p>
              <a
                href="mailto:support@webprotoolkit.com"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline hover:text-indigo-500 transition-colors"
              >
                support@webprotoolkit.com
              </a>
            </div>
            {/* Live Chat */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 hover:text-purple-500 transition-colors">
                Live Chat
              </h3>
              <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                Available 24/7
              </p>
              <button className="text-purple-600 dark:text-purple-400 font-medium hover:underline hover:text-purple-500 transition-colors">
                Start a conversation
              </button>
            </div>
            {/* Phone */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 hover:text-pink-500 transition-colors">
                Call Us
              </h3>
              <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                Mon-Fri, 9am-5pm EST
              </p>
              <a
                href="tel:+18005551234"
                className="text-pink-600 dark:text-pink-400 font-medium hover:underline hover:text-pink-500 transition-colors"
              >
                +1 (800) 555-1234
              </a>
            </div>
          </div>
          {/* Contact Button */}
          <a
            href="#contact-form"
            className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:bg-gradient-to-r dark:from-blue-400 dark:to-indigo-500 dark:hover:from-blue-500 dark:hover:to-indigo-600 rounded-lg shadow-sm hover:shadow transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}

