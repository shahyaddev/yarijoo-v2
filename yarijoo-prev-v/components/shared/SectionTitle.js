import Link from "next/link";
import React from "react";

const SectionTitle = ({ text1, text2, bgColor, icon, link, linkClassNames, count, countLabel }) => {
  return (
    <div className={`w-full h-[104px] flex justify-between items-center bg-gradient-to-l ${bgColor || "from-[#222529] to-transparent"} rounded-2xl p-5 relative z-10 border border-borderColor/60`}> 
      <div className="flex items-center gap-3">
        <div className={`size-12 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex justify-center items-center border border-primaryThemeColor/20`}>
          <i className={`${icon} text-xl h-5`}></i>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-primaryTextColor">
            {text1}
          </h2>
          <h3 className="font-semibold text-secondaryTextColor">{text2}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {typeof count !== "undefined" && (
          <div className="h-11 px-4 rounded-full bg-darkThemeColor border border-borderColor text-secondaryTextColor flex items-center gap-2">
            <span className="font-bold text-primaryTextColor">{count}</span>
            {countLabel && <span className="text-sm">{countLabel}</span>}
          </div>
        )}

        {link && (
          <Link
            href={link}
            className={`w-fit hidden px-5 h-11 rounded-full text-sm font-semibold sm:flex items-center gap-3 transition-all duration-300 bg-primaryThemeColor/15 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor ${linkClassNames}`}
          >
            <span>مشاهده همه</span>
            <i className="fi fi-rr-arrow-up-right-from-square h-[14px] -scale-x-100"></i>
          </Link>
        )}
      </div>
    </div>
  );
};

export default SectionTitle;

