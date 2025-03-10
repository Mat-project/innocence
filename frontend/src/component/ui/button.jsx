
import React from "react";
import PropTypes from "prop-types";

export function Button({ children, variant = "default", size = "default", className = "", ...props }) {
  // Define base styles and variants using Tailwind CSS
  const baseClass = "px-4 py-2 rounded-md font-medium focus:outline-none transition-colors";
  let variantClass = "";
  if (variant === "ghost") {
    variantClass = "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700";
  } else if (variant === "outline") {
    variantClass = "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
  } else {
    // default variant
    variantClass = "bg-indigo-600 text-white hover:bg-indigo-700";
  }
  
  let sizeClass = "";
  if (size === "icon") {
    sizeClass = "p-2";
  } else if (size === "sm") {
    sizeClass = "text-sm";
  } else {
    sizeClass = "text-base";
  }
  
  return (
    <button className={`${baseClass} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "ghost", "outline"]),
  size: PropTypes.oneOf(["default", "icon", "sm"]),
  className: PropTypes.string,
};

export default Button;