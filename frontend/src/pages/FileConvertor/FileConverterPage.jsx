//// filepath: d:/project/innovsence/frontend/src/pages/FileConvertor/FileConverterPage.jsx
import React from 'react';
import FileConvertor from './FileConvertor'; // your existing converter form component
/* import { ReactComponent as LogoIcon } from '../../assets/logo-icon.svg'; // if you have an SVG asset or inline below
 */
export default function FileConverterPage() {
  return (
    <>
      {/* Header / Navbar */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white w-9 h-9 rounded-lg flex items-center justify-center">
              {/* You can use an imported SVG asset or inline SVG */}
{/*               <LogoIcon /> */}
            </div>
            <span className="text-xl font-bold text-indigo-600">FILE CONVERTER</span>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Convert Your Files with Ease
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple, fast and free solution to convert your files to any format. No registration required.
          </p>
        </section>

        {/* Converter Section */}
        <section className="bg-white rounded-lg shadow p-6">
          {/* You can add tab headers here if needed */}
          <FileConvertor />
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              {/* Example SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22a9.97 9.97 0 0 0 7.07-2.93A9.97 9.97 0 0 0 22 12a9.97 9.97 0 0 0-2.93-7.07A9.97 9.97 0 0 0 12 2a9.97 9.97 0 0 0-7.07 2.93A9.97 9.97 0 0 0 2 12a9.97 9.97 0 0 0 2.93 7.07A9.97 9.97 0 0 0 12 22z"></path>
                <path d="M9 15l6-6"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Fast Conversion</h3>
            <p className="text-gray-600">
              Convert your files at lightning speed with our optimized processing engine.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              {/* Example SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Multiple Formats</h3>
            <p className="text-gray-600">
              Support for a wide range of file formats including images, PDFs, documents, audio, and more.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              {/* Example SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M8 12l2 2 4-4"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Secure Processing</h3>
            <p className="text-gray-600">
              Your files are processed securely and privately on your own device without uploading to any server.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}


      {/* Optional Toast Notification */}
{/*       <div id="toast" className="fixed bottom-5 right-5 bg-gray-800 text-white p-4 rounded-lg shadow flex items-center gap-3 transform translate-y-0 opacity-100 transition-all">
        <div className="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
        </div>
        <div className="toast-content">
          <h4 className="font-bold">Notification</h4>
          <p className="text-sm">This is a notification message.</p>
        </div>
        <button className="toast-close text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div> */}
    </>
  );
}