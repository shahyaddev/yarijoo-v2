import Link from "next/link";
import React from "react";

const CustomButton = ({
  link = "#",
  className = "",
  iconClassName = "",
  children,
}) => {
  return link ? (
    <Link
      href={link}
      className={`flex items-center justify-center font-light gap-3 h-11 rounded-2xl text-primaryThemeColor bg-primaryThemeColor bg-opacity-15 p-1 pr-3 ${className}`}
    >
      {children}

      <div
        className={`flex items-center justify-center h-full text-lightTextColor bg-primaryThemeColor rounded-xl px-3 ${iconClassName}`}
      >
        <i className="fi fi-rr-arrow-left h-4"></i>
      </div>
    </Link>
  ) : (
    <button
      className={`flex items-center font-light gap-3 h-11 rounded-2xl text-primaryThemeColor bg-primaryThemeColor bg-opacity-15 p-1 pr-3 ${className}`}
    >
      {children}

      <div
        className={`flex items-center justify-center h-full text-lightTextColor bg-primaryThemeColor rounded-xl px-3 ${iconClassName}`}
      >
        <i className="fi fi-rr-arrow-left h-4"></i>
      </div>
    </button>
  );
};

export default CustomButton;
