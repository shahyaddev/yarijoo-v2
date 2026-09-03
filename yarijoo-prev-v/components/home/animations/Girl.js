"use client";
import React from "react";
import girlAnime from "@/animates/girl.json";
import Lottie from "lottie-react";

const Girl = () => {
  return (
    <Lottie
      className="lg:size-[500px] mb-3 [&>svg>g]:scale-[1.5] [&>svg>g]:origin-center"
      animationData={girlAnime}
      loop={true}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true }}
    />
  );
};

export default Girl;
