"use client";

import React, { useCallback, useTransition } from "react";
import { toFarsiNumber } from "@/helper/helper";
import { MdCardGiftcard } from "react-icons/md";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import CustomLoading from "@/components/shared/CustomLoading";

const SortDesktop = ({ productLength }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
    { name: "محبوب ترین", query: "popular" },
  ];

  const setSortParamHandler = (param) => {
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("sort", param.query));
    });
  };

  return (
    <div className="">
      <CustomLoading isLoading={isPending} />

      <div className="w-full bg-secondaryThemeColor h-16 rounded-2xl lg:flex hidden justify-between items-center px-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-primaryTextColor">
            <i className="fi fi-br-sort-amount-down-alt h-4"></i>

            <span className="text-sm font-semibold">
              مرتـــب ســازی بر اساس :
            </span>
          </div>

          {sorts.map((sortOptions) => (
            <button
              onClick={() => setSortParamHandler(sortOptions)}
              className={`${
                sortOptions.query === sort ||
                (!sort && sortOptions.query === "newest")
                  ? "text-primaryThemeColor border-primaryThemeColor"
                  : "text-secondaryTextColor border-secondaryThemeColor"
              } text-sm border-t-2 border-b-2 h-16 block relative ml-2 hover:text-primaryThemeColor transition-all duration-300`}
            >
              {sortOptions.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortDesktop;
