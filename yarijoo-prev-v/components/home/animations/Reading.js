"use client";
import React from "react";
import anime from "@/animates/reading.json";
import Lottie from "lottie-react";

const Reading = () => {
  return (
    <Lottie
      className="w-full lg:w-[600px] -mt-4 lg:-mt-16 -mr-20 [&>svg>g]:scale-[1.5] [&>svg>g]:origin-center"
      animationData={anime}
      loop={true}
    />
  );
};

export default Reading;
