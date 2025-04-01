import { useEffect, useRef } from "react";
import {
  Briefcase,
  Users,
  FolderArchive,
  Edit,
  Activity,
  Calendar,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export default function Features() {
  const featureRefs = useRef([]);

  const addToRefs = (el) => {
    if (el && !featureRefs.current.includes(el)) {
      featureRefs.current.push(el);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            entry.target.classList.remove("opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    featureRefs.current.forEach((el) => observer.observe(el));

    return () => {
      featureRefs.current.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  const features = [
    {
      icon: <Briefcase className="h-10 w-10 text-purple-500 dark:text-purple-300" />,
      title: "Productivity Tools",
      description: "Streamline your workflow with intuitive tools to boost efficiency.",
    },
    {
      icon: <Users className="h-10 w-10 text-green-500 dark:text-green-300" />,
      title: "Team Collaboration",
      description: "Collaborate in real time with seamless integration.",
    },
    {
      icon: <FolderArchive className="h-10 w-10 text-orange-500 dark:text-orange-300" />,
      title: "File Management",
      description: "Organize, store, and share files with ease.",
    },
    {
      icon: <Edit className="h-10 w-10 text-teal-500 dark:text-teal-300" />,
      title: "Editors",
      description: "Edit documents with our suite of professional tools.",
    },
    {
      icon: <Activity className="h-10 w-10 text-red-500 dark:text-red-300" />,
      title: "Performance Tracking",
      description: "Monitor productivity patterns with personalized insights.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-blue-500 dark:text-blue-300" />,
      title: "Smart Scheduling",
      description: "Plan your day efficiently with AI-powered scheduling.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-indigo-500 dark:text-indigo-300" />,
      title: "Analytics Dashboard",
      description: "Gain insights with comprehensive analytics and reports.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-pink-500 dark:text-pink-300" />,
      title: "Integrated Chat",
      description: "Stay connected with team chat integrated into the platform.",
    },
  ];

  return (
    <section className="py-20 w-full bg-gray-50 dark:bg-gray-900 mb-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium mb-4 hover:scale-105 transition-transform">
            Powerful Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Everything You Need to <span className="gradient-text">Supercharge</span> Your Workflow
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Our comprehensive suite of tools is designed to help you work smarter, not harder.
            Discover how WebPro Toolkit can transform your productivity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={addToRefs}
              className="opacity-0 transform translate-y-4 transition-all duration-700 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-transparent p-5 rounded-2xl bg-white dark:bg-gray-800"
              style={{ animationDelay: (0.1 * index) + 's' }}
            >
              <div className="mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}