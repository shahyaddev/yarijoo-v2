"use client";

import { toFarsiNumber } from "@/helper/helper";
import React, { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const ChartResult = ({ chartData }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      { name: "امتیاز تفکر عاملی", value: chartData?.agency_score || 0 }, // #dc2626
      { name: "امتیاز تفکر راهبردی", value: chartData?.pathway_score || 0 }, // #3b82f6
    ]);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="flex flex-col w-60">
          <div className="w-full p-3 text-xs bg-darkThemeColor rounded-2xl border border-borderColor text-primaryTextColor">
            {payload[0].payload.name}: {toFarsiNumber(payload[0].payload.value)}
          </div>
        </div>
      );
    }

    return null;
  };

  const CustomLabel = ({ x, y, value, width, payload }) => {
    return (
      <text
        x={x}
        y={y > 100 ? 314 : 16}
        fill={y > 100 ? "#3b82f6" : "#dc2626"}
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {payload.name}
      </text>
    );
  };

  return (
    <div className="w-full h-80 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            label={<CustomLabel />}
            data={data}
            innerRadius={90}
            outerRadius={120}
            fill="#fbc02d"
            stroke="#3c4148"
          >
            {data.map((item, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "#dc2626" : "#3b82f6"}
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartResult;
