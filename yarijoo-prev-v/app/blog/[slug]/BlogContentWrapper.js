"use client";
import React, { useState, createContext, useEffect } from "react";

export const FontSizeContext = createContext({
  fontSize: "base",
  setFontSize: () => {},
});

const BlogContentWrapper = ({ children }) => {
  const [fontSize, setFontSize] = useState("base");

  useEffect(() => {
    const fontSizeMap = {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    };

    const blogPostElements = document.querySelectorAll(".blog-post");
    blogPostElements.forEach((el) => {
      el.style.fontSize = fontSizeMap[fontSize] || "1rem";
    });
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export default BlogContentWrapper;

