"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const boxes = [
  { id: 1, color: "#f87171" }, // Red
  { id: 2, color: "#60a5fa" }, // Blue
  { id: 3, color: "#34d399" }, // Emerald
  { id: 4, color: "#fbbf24" }, // Amber
  { id: 5, color: "#db2777" }, // Pink
  { id: 6, color: "#16a34a" }, // Green
  { id: 7, color: "#8b5cf6" }, // Violet
  { id: 8, color: "#f472b6" }, // Rose
  { id: 9, color: "#10b981" }, // Teal
];

const shuffleArray = (array) => {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const AnimatedBoxes = () => {
  const [order, setOrder] = useState(boxes);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prev) => shuffleArray(prev));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full grid grid-cols-3 grid-rows-3 col-span-2 gap-4">
      {order.map((box) => (
        <motion.div
          key={box.id}
          layout
          layoutId={`box-${box.id}`}
          className="w-full rounded-xl shadow-lg"
          style={{ backgroundColor: box.color }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      ))}
    </div>
  );
};

export default AnimatedBoxes;
