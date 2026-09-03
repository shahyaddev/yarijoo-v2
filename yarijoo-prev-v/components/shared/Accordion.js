"use client"

import React, { useState } from "react";

const Accordion = ({ data }) => {
  const [openTab, setOpenTab] = useState(false);

  return (
    <div
      className={`w-full ${
        openTab ? "h-fit max-h-96 pb-5" : "max-h-16"
      } transition-all duration-300 relative px-5 overflow-hidden flex flex-col gap-4 rounded-2xl bg-secondaryThemeColor`}
    >
      <div
        onClick={() => setOpenTab(!openTab)}
        className="w-full cursor-pointer flex min-h-[64px] justify-between items-center text-primaryTextColor"
      >
        <h2 className={`${openTab ? "text-primaryThemeColor" : "text-primaryTextColor"} text-sm sm:text-base`}>
          {data.question}
        </h2>

        <div
          className={`${
            openTab && "rotate-180"
          } duration-300 p-2 rounded-xl z-10 left-3 top-[14px] outline-none border-none`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 stroke-primaryThemeColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>

      <p className="text-secondaryTextColor text-xs sm:text-sm">
       {data.answer}
      </p>
    </div>
  );
};

export default Accordion;
