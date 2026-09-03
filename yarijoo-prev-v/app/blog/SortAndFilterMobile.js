"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { TbCategory2 } from "react-icons/tb";
import { TbFilterSearch } from "react-icons/tb";
import { TbArrowsSort } from "react-icons/tb";
import { FaCheck } from "react-icons/fa6";
import { Radio, RadioGroup } from "@nextui-org/react";
import CustomLoading from "@/components/shared/CustomLoading";

const SortAndFilterMobile = ({ categories }) => {
  const [openSort, setOpenSort] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const search = searchParams.get("search");
  const category = searchParams.get("category");
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

  const name = {
    newest: "جـــدید تــرین",
    oldest: "قـــدیمی تــرین",
    popular: "مـــحبوب تــرین",
  };

  const sorts = [
    { name: "جـــدید تــرین", query: "newest" },
    { name: "قـــدیمی تــرین", query: "lowest" },
    { name: "مـــحبوب تــرین", query: "popular" },
  ];

  useEffect(() => {
    setSearchVal(search);
    setSelectedCategory(category);

    if (openSort || openFilter) {
      document.querySelector("body").style.overflow = "hidden";
    } else {
      document.querySelector("body").style.overflow = "auto";
    }
  }, [openFilter, openSort]);

  // set sort value in url
  const setSortParamHandler = (param) => {
    setOpenSort(false);
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("sort", param.query));
    });
  };

  // set search value to url
  const setSearchParamHandler = (e) => {
    e.preventDefault();
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("search", searchVal));
    });
  };

  // clear search
  const clearSearchHandler = () => {
    setSearchVal("");
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("search", ""));
    });
  };

  // set category slug to url
  const setCategoryParamHandler = () => {
    startTransition(() => {
      router.push(
        pathname + "?" + createQueryString("category", selectedCategory)
      );
    });

    setOpenFilter(false);
  };

  // clear all filters
  const clearFiltersHandler = () => {
    router.push("/shop");

    setOpenFilter(false);
    setSelectedCategory("");
  };

  return (
    <div className="w-full flex flex-col gap-4 lg:hidden">
      <CustomLoading isLoading={isPending} />
      {/* black background */}
      <div
        onClick={() => {
          setOpenSort(false);
          setOpenFilter(false);
        }}
        className={`${
          openSort || openFilter ? "opacity-100 visible" : "opacity-0 invisible"
        } bg-black bg-opacity-60 fixed top-0 left-0 w-full h-full z-[999] transition-all duration-300`}
      ></div>

      {/* sort drawer */}
      <div
        className={`${
          openSort
            ? "opacity-100 visible bottom-0"
            : "opacity-0 invisible -bottom-full"
        } bg-secondaryThemeColor flex flex-col gap-5 fixed left-0 w-full h-auto z-[9999] transition-all duration-300 rounded-t-3xl overflow-hidden`}
      >
        <div className="w-full flex items-center justify-between p-5 bg-darkThemeColor">
          <span className="text-primaryTextColor font-bold">
            مرتب سازی بر اساس
          </span>

          <button className="text-danger">
            <IoCloseOutline className="size-6" />
          </button>
        </div>

        {sorts.map((sortOptions) => (
          <button
            onClick={() => setSortParamHandler(sortOptions)}
            className={`${
              sortOptions.query === sort
                ? "text-primaryThemeColor"
                : "text-secondaryTextColor"
            } px-5 flex items-center justify-between pb-5 border-b last:border-b-0 border-borderColor transition-all duration-300`}
          >
            <span>{sortOptions.name}</span>

            <div
              className={`size-6 rounded-full border-2 p-[2px] ${
                sortOptions.query === sort
                  ? "border-primaryThemeColor"
                  : "border-secondaryTextColor"
              }`}
            >
              <div
                className={`${
                  sortOptions.query === sort
                    ? "opacity-100 scale-100"
                    : "opacity-0 -scale-50"
                } w-full h-full bg-primaryThemeColor flex justify-center items-center rounded-full transition-all duration-300`}
              >
                <FaCheck className="size-[10px] text-primaryTextColor" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* filter drawer */}
      <div
        className={`${
          openFilter
            ? "opacity-100 visible left-0"
            : "opacity-0 invisible -left-full"
        } bg-secondaryThemeColor flex flex-col justify-between fixed bottom-0 w-full h-full z-[9999] transition-all duration-300 overflow-hidden`}
      >
        <div className="w-full flex flex-col">
          <div className="w-full flex items-center justify-between p-5 bg-darkThemeColor">
            <span className=" text-primaryTextColor font-bold">
              فیـــلتر محصــولات
            </span>

            <button
              onClick={() => setOpenFilter(false)}
              className="text-danger"
            >
              <IoCloseOutline className="size-6" />
            </button>
          </div>

          <div className="w-full flex flex-col gap-4 mt-4">
            {/* catgories */}
            <div className="w-full flex flex-col gap-2 h-auto pt-2 px-5 overflow-hidden">
              <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
                <i className="fi fi-rr-category h-4"></i>

                <span className="text-sm font-bold">دسته بندی ها</span>

                <div className="absolute w-2 h-full bg-secondaryThemeColor rounded-full -right-6"></div>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-4">
                <RadioGroup
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  classNames={{ wrapper: "gap-4" }}
                >
                  {categories.map((category) => (
                    <Radio
                      key={category.slug}
                      classNames={{
                        control: "!bg-primaryThemeColor",
                        wrapper:
                          "border-secondaryTextColor group-data-[selected=true]:!border-primaryThemeColor group-data-[hover-unselected=true]:!bg-[#444]",
                        label: "!text-secondaryTextColor",
                      }}
                      value={category.slug}
                    >
                      {category.name}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        {/* buttons */}
        <div className="w-full grid grid-cols-2 gap-4 p-5">
          <button
            onClick={setCategoryParamHandler}
            className="w-full h-12 rounded-2xl bg-primaryThemeColor text-primaryTextColor flex justify-center items-center"
          >
            اعمال فیلتر ها
          </button>

          <button
            onClick={clearFiltersHandler}
            disabled={!category}
            className="w-full h-12 rounded-2xl disabled:opacity-60 bg-red-600 bg-opacity-15 text-red-600 flex justify-center items-center"
          >
            حذف فیلتر ها
          </button>
        </div>
      </div>

      {/* search */}
      <form onSubmit={setSearchParamHandler} className="w-full h-14 relative">
        <input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          type="text"
          className="w-full h-full rounded-2xl text-primaryTextColor bg-secondaryThemeColor outline-none px-5 text-sm"
          placeholder="جست و جو در محصولات..."
        />

        {searchVal && (
          <div
            onClick={clearSearchHandler}
            className="flex absolute cursor-pointer top-2/4 -translate-y-2/4 left-16"
          >
            <i className="fi fi-rr-cross h-4 text-danger"></i>
          </div>
        )}

        <button
          type="submit"
          className="flex absolute top-2/4 -translate-y-2/4 text-primaryTextColor left-5"
        >
          <i className="fi fi-rr-search text-xl h-5"></i>
        </button>
      </form>

      <div className="w-full grid grid-cols-2 gap-4">
        <button
          onClick={() => setOpenFilter(true)}
          className="flex items-center h-14 text-primaryTextColor gap-2 relative px-4 rounded-2xl bg-secondaryThemeColor overflow-hidden"
        >
          <i className="fi fi-rr-filter-list text-xl h-5"></i>
          <span className="text-sm font-semibold">فیـــلتر محصــولات</span>

          <div className="absolute w-2 h-2/4 bg-primaryThemeColor rounded-full -right-1"></div>
        </button>

        <button
          onClick={() => setOpenSort(true)}
          className="flex items-center h-14 text-primaryTextColor gap-2 relative px-4 rounded-2xl bg-secondaryThemeColor overflow-hidden"
        >
          <i className="fi fi-rr-sort-amount-down-alt text-xl h-5"></i>
          <span className="text-sm font-semibold">
            {name[sort] ? name[sort] : "جـــدید تــرین"}
          </span>

          <div className="absolute w-2 h-2/4 bg-primaryThemeColor rounded-full -right-1"></div>
        </button>
      </div>
    </div>
  );
};

export default SortAndFilterMobile;
