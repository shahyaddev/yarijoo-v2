"use client";
import React from "react";
import anime from "@/animates/personal.json";
import Lottie from "lottie-react";

const Personal = () => {
  return (
    <Lottie
      className="size-[450px] mb- [&>svg>g]:scale-[1.5] [&>svg>g]:origin-center"
      animationData={anime}
      loop={true}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true }}
    />
  );
};

export default Personal;
