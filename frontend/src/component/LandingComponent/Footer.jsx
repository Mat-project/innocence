import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react"
import ThemeToggle from "../common/ThemeToggle"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Integrations", href: "/integrations" },
        { name: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Blog", href: "/blog" },
        { name: "Support", href: "/support" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Terms", href: "/terms" },
        { name: "Privacy", href: "/privacy" },
        { name: "Cookies", href: "/cookies" },
        { name: "Licenses", href: "/licenses" },
      ],
    },
  ]

  const socialLinks = [
    { icon: <Facebook size={20} />, href: "https://facebook.com", label: "Facebook" },
    { icon: <Twitter size={20} />, href: "https://twitter.com", label: "Twitter" },
    { icon: <Instagram size={20} />, href: "https://instagram.com", label: "Instagram" },
    { icon: <Linkedin size={20} />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Github size={20} />, href: "https://github.com", label: "GitHub" },
  ]

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-16 pb-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                <Link to="/" className="flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                  <span>TaskVerse</span>
                </Link>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Streamline your workflow and collaborate effortlessly with our all‑in‑one productivity platform.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.href} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">© {currentYear} WebPro Toolkit. All rights reserved.</div>
          <div className="flex items-center gap-6">

            <select className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5">
              <option value="en">English (US)</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}

