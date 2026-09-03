"use client";

import React, { useCallback } from "react";
import { toFarsiNumber } from "@/helper/helper";
import { MdCardGiftcard } from "react-icons/md";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";

const SortDesktop = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const sort = searchParams.get("sort");

  const sorts = [
    { name: "جدید ترین", query: "newest" },
    { name: "قدیمی ترین", query: "oldest" },
    { name: "ارزان ترین", query: "lowest_price" },
    { name: "گران ترین", query: "highest_price" },
  ];

  const setSortParamHandler = (param) => {
    router.push(pathname + "?" + createQueryString("sort", param.query));
  };

  return (
    <div className="w-full h-16 rounded-2xl lg:flex hidden justify-between items-center px-5 border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-primaryTextColor">
          <i className="fi fi-br-sort-amount-down-alt h-4"></i>

          <span className="text-sm font-semibold">
            مرتـــب ســازی بر اساس :
          </span>
        </div>

        {sorts.map((sortOptions) => (
          <button
            key={sortOptions.query}
            onClick={() => setSortParamHandler(sortOptions)}
            className={`${
              sortOptions.query === sort ||
              (!sort && sortOptions.query === "newest")
                ? "text-primaryThemeColor border-primaryThemeColor/80 bg-primaryThemeColor/10"
                : "text-secondaryTextColor border-transparent"
            } text-sm border h-10 rounded-xl px-4 ml-1 hover:text-primaryThemeColor hover:border-primaryThemeColor/40 hover:bg-primaryThemeColor/5 transition-all duration-300`}
          >
            {sortOptions.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortDesktop;
