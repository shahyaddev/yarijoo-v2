"use client";
import React from "react";
import girlAnime from "@/animates/discussion.json";
import Lottie from "lottie-react";

const Discussion = () => {
  return (
    <Lottie
      className="w-full lg:size-[650px] -mt-24 lg:-mt-44 [&>svg>g]:scale-[1.3] [&>svg>g]:origin-top"
      animationData={girlAnime}
      loop={true}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true }}
    />
  );
};

export default Discussion;
