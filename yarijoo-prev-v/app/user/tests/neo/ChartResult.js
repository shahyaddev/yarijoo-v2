"use client"

import React from "react";
import Chart from "react-apexcharts";

const ChartResult = ({options, res}) => {
  return (
    <Chart
      options={options.options}
      series={[Math.round((res.total * 100) / 48)]}
      type="radialBar"
      height="400px"
      width="100%"
    />
  );
};

export default ChartResult;
