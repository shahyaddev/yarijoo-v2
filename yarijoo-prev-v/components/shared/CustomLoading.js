import { Spinner } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

const CustomLoading = ({ isLoading }) => {
  return isLoading ? (
    <>
      <div
        className={`w-full h-full bg-black bg-opacity-70 fixed z-[999] right-0 left-0 top-0 bottom-0 fade-in`}
      ></div>
      <div className="w-60 h-32 flex flex-col gap-4 justify-center p-4 items-center rounded-2xl bg-darkThemeColor fixed z-[9999] left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 fade-in">
        <Spinner
          label="درحال بارگذاری..."
          classNames={{
            circle1: "border-b-primaryThemeColor",
            circle2: "border-b-primaryThemeColor",
            label: "text-sm text-primaryTextColor",
          }}
        />
      </div>
    </>
  ) : null;
};

export default CustomLoading;
