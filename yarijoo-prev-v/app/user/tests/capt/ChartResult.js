"use client";
import { toFarsiNumber } from "@/helper/helper";
import React from "react";
import Chart from "react-apexcharts";

const ChartResult = ({ data, number, label, test }) => {
  const options = {
    series: [76],
    options: {
      colors: ["#fbc02d"],
      chart: {
        height: 350,
        type: "radialBar",
        offsetY: -10,
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          track: {
            background: "#222529",
            strokeWidth: "97%",
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91],
        },
      },
      stroke: {
        dashArray: 4,
      },
    },
  };

  return (
    <div className="w-full relative flex flex-col items-center text-primaryTextColor neo-chart -mt-1">
      <span className="-mb-2.5 block">{label}</span>

      <Chart
        options={options.options}
        series={[Math.round((data * 100) / number)]}
        type="radialBar"
        height="300px"
        width="100%"
      />

      <span className="absolute left-[60px] bottom-14">{toFarsiNumber(0)}</span>

      <span className="absolute right-14 bottom-14">{toFarsiNumber(65)}</span>

      <div className="absolute text-2xl font-black left-2/4 -translate-x-2/4 top-[50%] -translate-y-2/4">
        {toFarsiNumber(data > 65 ? 65 : data)}
      </div>
    </div>
  );
};

export default ChartResult;
