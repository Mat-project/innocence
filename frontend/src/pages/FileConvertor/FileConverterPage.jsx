import React from 'react';
import FileConvertor from './FileConvertor';
import { useTheme } from '../../context/ThemeContext';

export default function FileConverterPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Convert Your Files with Ease
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A simple, fast and free solution to convert your files to any format. No registration required.
          </p>
        </section>

        {/* Converter Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <FileConvertor />
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start transition-colors duration-200">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22a9.97 9.97 0 0 0 7.07-2.93A9.97 9.97 0 0 0 22 12a9.97 9.97 0 0 0-2.93-7.07A9.97 9.97 0 0 0 12 2a9.97 9.97 0 0 0-7.07 2.93A9.97 9.97 0 0 0 2 12a9.97 9.97 0 0 0 2.93 7.07A9.97 9.97 0 0 0 12 22z"></path>
                <path d="M9 15l6-6"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Fast Conversion</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Convert your files at lightning speed with our optimized processing engine.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start transition-colors duration-200">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Multiple Formats</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Support for a wide range of file formats including images, PDFs, documents, audio, and more.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start transition-colors duration-200">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M8 12l2 2 4-4"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Secure Processing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your files are processed securely and privately with automatic cleanup after processing.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} File Converter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}