"use client";

import { toFarsiNumber } from "@/helper/helper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React, { useCallback, useTransition } from "react";
import CustomLoading from "./CustomLoading";

const Pagination = ({ links }) => {
  const lastIndex = links?.links?.length - 1;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const nextPageHandler = () => {
    startTransition(() => {
      router.push(
        pathname + "?" + createQueryString("page", links?.current_page + 1)
      );
    });
  };

  const changePageByNumberHandler = (pageNumber) => {
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("page", pageNumber));
    });
  };

  const prevPageHandler = () => {
    startTransition(() => {
      router.push(
        pathname + "?" + createQueryString("page", links?.current_page - 1)
      );
    });
  };

  return (
    <div className="w-full flex justify-center items-center gap-4 mt-4">
      <CustomLoading isLoading={isPending} />

      <button
        disabled={!links?.prev_page_url}
        onClick={prevPageHandler}
        className={`size-11 disabled:opacity-70 flex justify-center items-center rounded-2xl bg-secondaryThemeColor text-primaryTextColor hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all duration-300`}
      >
        <i className="fi fi-rr-arrow-right h-4"></i>
      </button>

      {links?.links?.map(
        (link, index) =>
          index !== 0 &&
          lastIndex !== index && (
            <button
              onClick={() => changePageByNumberHandler(link.label)}
              className={`size-11 flex justify-center items-center rounded-2xl hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all duration-300 ${
                link.active
                  ? "bg-primaryThemeColor text-secondaryThemeColor"
                  : "bg-secondaryThemeColor text-primaryTextColor"
              }`}
            >
              {toFarsiNumber(link.label)}
            </button>
          )
      )}

      <button
        disabled={!links?.next_page_url}
        onClick={nextPageHandler}
        className={`size-11 disabled:opacity-70 flex justify-center items-center rounded-2xl bg-secondaryThemeColor text-primaryTextColor hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all duration-300`}
      >
        <i className="fi fi-rr-arrow-left h-4"></i>
      </button>
    </div>
  );
};

export default Pagination;
