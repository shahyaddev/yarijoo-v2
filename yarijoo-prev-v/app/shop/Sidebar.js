"use client";

import { Checkbox, CheckboxGroup, Radio, RadioGroup } from "@nextui-org/react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const Sidebar = ({ categories }) => {
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category");

  useEffect(() => {
    setSearchVal(search);

    setSelectedCategory(category);
  }, []);

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  // set search value to url
  const setSearchParamHandler = (e) => {
    e.preventDefault();

    router.push(pathname + "?" + createQueryString("search", searchVal));
  };

  // clear search
  const clearSearchHandler = () => {
    setSearchVal("");
    router.push(pathname + "?" + createQueryString("search", ""));
  };

  // set category slug to url
  const setCategoryParamHandler = (slug) => {
    setSelectedCategory(slug);

    router.push(pathname + "?" + createQueryString("category", slug));
  };

  // clear all filters
  const clearAllFiltersHandler = () => {
    setSelectedCategory("");
    setSearchVal("");
    router.push(pathname);
  };

  // check if any filter is active
  const hasActiveFilters = category || search;

  return (
    <div className="w-[260px] shrink-0 lg:flex hidden flex-col gap-4 sticky top-24">
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFiltersHandler}
          className="w-full h-12 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-600 flex items-center justify-center gap-2 transition-all border border-red-600/30"
        >
          <i className="fi fi-rr-cross-circle h-4"></i>
          <span className="text-sm font-bold">پاک کردن فیلتر‌ها</span>
        </button>
      )}

      {/* search */}
      <form
        onSubmit={setSearchParamHandler}
        className="w-full h-16 relative rounded-2xl border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]"
      >
        <input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          type="text"
          className="w-full h-full rounded-2xl text-primaryTextColor bg-transparent outline-none pr-12 pl-5 text-sm placeholder-secondaryTextColor/70"
          placeholder="جست و جو در محصولات..."
        />

        {searchVal && (
          <button
            type="button"
            onClick={clearSearchHandler}
            className="flex absolute cursor-pointer top-2/4 -translate-y-2/4 text-secondaryTextColor left-14 hover:text-danger transition-colors"
          >
            <i className="fi fi-rr-cross-small h-5"></i>
          </button>
        )}

        <button
          type="submit"
          className="flex absolute top-2/4 -translate-y-2/4 text-secondaryTextColor left-4"
        >
          <i className="fi fi-rr-search text-xl h-5"></i>
        </button>
      </form>

      {/* catgories */}
      <div className="w-full rounded-2xl flex flex-col gap-2 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-category h-4"></i>

          <span className="text-sm font-bold">دســـته بنــدی ها</span>

          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 flex flex-col gap-4">
          <RadioGroup
            value={selectedCategory}
            onValueChange={setCategoryParamHandler}
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

      {/* Price Range */}
      <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-dollar h-4"></i>
          <span className="text-sm font-bold">محدوده قیمت</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 space-y-3">
          {[
            { label: "رایگان", value: "free" },
            { label: "زیر ۱۰۰ هزار تومان", value: "0-100000" },
            { label: "۱۰۰ تا ۵۰۰ هزار", value: "100000-500000" },
            { label: "بالای ۵۰۰ هزار", value: "500000+" },
          ].map((range) => (
            <button
              key={range.value}
              className="w-full text-right text-sm text-secondaryTextColor hover:text-primaryThemeColor transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special Offers */}
      <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-badge-percent h-4"></i>
          <span className="text-sm font-bold">پیشنهادهای ویژه</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <CheckboxGroup
        classNames={{
          base: "border-t border-borderColor pt-4",
          wrapper: "flex flex-col gap-4",
        }}
      >
          {[
            { label: "محصولات تخفیف‌دار", value: "discounted" },
            { label: "محصولات جدید", value: "new" },
            { label: "پرفروش‌ترین‌ها", value: "top-selling" },
          ].map((item) => (
        <Checkbox
          key={item.value}
          value={item.value}
          classNames={{
            base: "transition-colors rounded-xl bg-[#111318] hover:bg-[#1a1e25] border border-transparent data-[selected=true]:border-primaryThemeColor data-[selected=true]:bg-primaryThemeColor/10 px-3 py-2",
            wrapper: "rounded-xl transition-colors data-[hover-unselected=true]:bg-[#1a1e25] data-[selected=true]:bg-primaryThemeColor/20",
            label: "text-sm text-secondaryTextColor group-data-[selected=true]:text-primaryThemeColor",
            indicator: "border border-primaryThemeColor group-data-[selected=true]:!bg-primaryThemeColor group-data-[selected=true]:!border-primaryThemeColor",
            icon: "text-darkThemeColor",
          }}
        >
              {item.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
};

export default Sidebar;
