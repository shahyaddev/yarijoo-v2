"use client"

import { toFarsiNumber } from "@/helper/helper";
import React, { useEffect, useRef, useState } from "react";

const CounterNumber = ({ target = 1000, duration = 2500, suffix = "+", className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // فقط یک بار اجرا بشه
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      // استفاده از easing function برای انیمیشن نرم‌تر (ease-out)
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.floor(easeOut * target);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return (
    <span ref={ref} className={className}>
      {toFarsiNumber(count)}{suffix}
    </span>
  );
};

export default CounterNumber;
