"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

export default function Testimonials() {
  const testimonialsRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      quote:
        "The productivity tools are a game changer! My admin work halved.",
      author: "Alex Johnson",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "/placeholder.svg?height=100&width=100&text=AJ",
    },
    {
      quote:
        "The design is modern, and the interface is intuitive. A superb experience!",
      author: "Maria Garcia",
      role: "UX Designer",
      company: "DesignHub",
      avatar: "/placeholder.svg?height=100&width=100&text=MG",
    },
    {
      quote:
        "WebPro Toolkit keeps me organized and efficient. Collaboration features truly stand out.",
      author: "Liam Smith",
      role: "Software Developer",
      company: "CodeWorks",
      avatar: "/placeholder.svg?height=100&width=100&text=LS",
    },
    {
      quote:
        "Since using WebPro Toolkit, our team's productivity increased by 35%.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "GlobalTech",
      avatar: "/placeholder.svg?height=100&width=100&text=SC",
    },
  ]

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
    if (testimonialsRef.current) observer.observe(testimonialsRef.current)
    return () => {
      if (testimonialsRef.current) observer.unobserve(testimonialsRef.current)
    }
  }, [])

  const nextTestimonial = () =>
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  const prevTestimonial = () =>
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 mx-auto">
        <div ref={testimonialsRef} className="text-center max-w-3xl mx-auto mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 text-sm font-medium mb-4">
            <span>Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Hear feedback from professionals across industries.
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="p-8 bg-white dark:bg-gray-700 rounded-xl shadow hover:shadow-2xl transition-shadow">
                    <Quote className="h-12 w-12 text-indigo-200 dark:text-indigo-800 mb-6" />
                    <p className="text-xl mb-8 text-gray-800 dark:text-gray-100">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.author}
                        className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-indigo-200 dark:border-indigo-800"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{testimonial.author}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-800 dark:text-gray-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex gap-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeIndex
                      ? "bg-indigo-600"
                      : "bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-400 dark:hover:bg-indigo-700"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-800 dark:text-gray-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

