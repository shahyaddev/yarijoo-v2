"use client";
import React, { useRef, useEffect } from "react";
import TreeAnim from "@/animates/leaf-1.json";
import Lottie from "lottie-react";

const Tree = () => {
  const lottieRef = useRef(null);

  useEffect(() => {
    const anim = lottieRef.current;
    if (!anim) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      const totalFrames = anim.getDuration(true);
      anim.goToAndStop(progress * totalFrames, true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // sync initial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
// [&>svg>g]:scale-[1.5] [&>svg>g]:origin-center
  return (
    <Lottie
      lottieRef={lottieRef}
      className="w-[300px] absolute -right-20 -scale-x-100 -bottom-4 mb-3 z-[9999]"
      animationData={TreeAnim}
      loop={false}
      autoplay={false}
    />
  );
};

export default Tree;
