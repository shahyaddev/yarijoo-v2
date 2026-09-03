"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import { EffectCoverflow } from "swiper/modules";
import { toFarsiNumber } from "@/helper/helper";
import CustomButton from "../shared/CustomButton";
import { psychologicalTests } from "@/app/user/tests/psychologicalTestsData";

const buildIcon = (icon) => {
  if (React.isValidElement(icon)) {
    const existing = icon.props?.className ? ` ${icon.props.className}` : "";
    return React.cloneElement(icon, {
      className: `size-8 text-primaryThemeColor${existing}`,
    });
  }
  if (typeof icon === "string" && icon.length > 0) {
    return (
      <i className={`${icon} text-3xl leading-none text-primaryThemeColor`}></i>
    );
  }
  return <i className="fi fi-rr-star text-3xl leading-none text-primaryThemeColor"></i>;
};

const generateStats = (test, index) => {
  const base = `${test.id ?? test.title ?? ""}-${index}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const safeHash = Math.abs(hash);
  let score = 4 + (safeHash % 90) / 90;
  if (score >= 5) {
    score = 4.9;
  }
  if (score <= 4) {
    score = 4.1;
  }
  const roundedScore = Number(score.toFixed(1));
  const completed = 850 + (safeHash % 32000);
  return {
    score: roundedScore,
    completed,
  };
};

const TestsSlider = () => {
  return (
    <div className="w-full h-auto mt-4 md:mt-8 relative">
      <div className="size-[450px] rounded-full p-6 border border-primaryThemeColor absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4">
        <div className="w-full h-full rounded-full bg-primaryThemeColor shadow-[0_0_100px_#17c964]"></div>
      </div>

      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
        }}
        loop
        className="test-slider !py-4"
      >
        {psychologicalTests.map((test, index) => {
          const iconContent = buildIcon(test.icon);
          const generated = generateStats(test, index);
          const stats = {
            score: test.score ?? generated.score,
            completed: test.completed ?? generated.completed,
          };
          return (
            <SwiperSlide key={index} className="max-w-[500px] rounded-3xl">
              <div className="w-full h-[420px] rounded-3xl bg-gradient-to-br from-[#1f2126] via-[#181b1f] to-[#131519] border border-borderColor/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-primaryThemeColor/15 border border-primaryThemeColor/25 flex items-center justify-center shadow-[0_12px_35px_rgba(23,201,100,0.2)]">
                    {iconContent}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="block w-fit items-center rounded-full border border-primaryThemeColor/25 bg-primaryThemeColor/10 px-3 py-1 text-xs font-medium text-primaryThemeColor/80">
                      {test.category}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold leading-7 text-primaryTextColor">
                      {test.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 text-sm leading-7 text-secondaryTextColor">
                  {String(test.details)
                    .split("\n")
                    .filter((line) => line.trim().length > 0)
                    .map((line, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-primaryThemeColor/70"></span>
                        <span className="flex-1">{line.trim()}</span>
                      </div>
                    ))}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1 text-sm text-secondaryTextColor/80">
                      <span>امتیاز</span>
                      <span className="text-lg font-semibold text-greenColor">
                        {toFarsiNumber(stats.score.toFixed(1))}
                      </span>
                    </div>
                    <div className="h-10 w-px bg-borderColor/50"></div>
                    <div className="flex flex-col gap-1 text-sm text-secondaryTextColor/80">
                      <span>تعداد انجام</span>
                      <span className="text-lg font-semibold text-success">
                        {toFarsiNumber(stats.completed)}
                      </span>
                    </div>
                  </div>
                  <CustomButton
                    link={test.link}
                    className="bg-primaryThemeColor/20 hover:bg-primaryThemeColor/30 hover:shadow-[0_15px_40px_rgba(23,201,100,0.25)] text-primaryThemeColor"
                  >
                    <span>شروع تست</span>
                  </CustomButton>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default TestsSlider;
