"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import SectionTitle from "@/components/shared/SectionTitle";
import React, { useMemo, useState, useEffect } from "react";
import { psychologicalTests, testCategories } from "../user/tests/psychologicalTestsData";
import Link from "next/link";
import Footer from "@/components/footer/Footer";
import { toFarsiNumber } from "@/helper/helper";
import { Select, SelectItem } from "@nextui-org/react";

const Page = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");

  // Update page title
  useEffect(() => {
    const categoryText = selectedCategory !== "همه" ? ` - ${selectedCategory}` : "";
    document.title = `تست‌های روانشناسی${categoryText} - یاریجو`;
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let tests = psychologicalTests;

    // فیلتر بر اساس دسته‌بندی
    if (selectedCategory !== "همه") {
      tests = tests.filter((t) => t.category === selectedCategory);
    }

    // فیلتر بر اساس جستجو
    const q = query.trim();
    if (q) {
      try {
        tests = tests.filter((t) =>
          (t?.title || "").toLowerCase().includes(q.toLowerCase()) ||
          (t?.description || "").toLowerCase().includes(q.toLowerCase())
        );
      } catch (_) {
        // در صورت خطا، تست‌های فیلتر شده بر اساس دسته‌بندی را برگردان
      }
    }

    return tests;
  }, [query, selectedCategory]);

  // گروه‌بندی تست‌ها بر اساس دسته
  const groupedTests = useMemo(() => {
    if (selectedCategory !== "همه" || query.trim()) {
      return null; // اگر فیلتر فعال است، گروه‌بندی نشان نده
    }

    const groups = {};
    psychologicalTests.forEach((test) => {
      const cat = test.category || "سایر";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(test);
    });
    return groups;
  }, [selectedCategory, query]);

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-4 px-4 lg:mt-24">
        <div className="w-full flex justify-between items-center">
          <SectionTitle
            text1="تست های روانشناسی"
            text2="یاریـــجــو"
            icon={"fi fi-sr-store-alt"}
          />
        </div>

        <div className="w-full flex flex-col md:flex-row gap-4">
          {/* فیلتر دسته‌بندی */}
          <div className="w-full md:w-64">
            <Select
              selectedKeys={new Set([selectedCategory])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setSelectedCategory(selected || "همه");
              }}
              placeholder="انتخاب دسته‌بندی"
              variant="flat"
              classNames={{
                base: "w-full",
                trigger: "h-12 rounded-xl bg-secondaryThemeColor border border-borderColor hover:border-primaryThemeColor/40 transition-all data-[hover=true]:bg-secondaryThemeColor data-[open=true]:bg-secondaryThemeColor !bg-secondaryThemeColor",
                value: "text-primaryTextColor text-sm group-data-[has-value=true]:text-primaryTextColor",
                popoverContent: "bg-secondaryThemeColor border border-borderColor/70",
                selectorIcon: "text-primaryTextColor",
                label: "text-primaryTextColor",
              }}
              listboxProps={{
                itemClasses: {
                  base: "!text-primaryTextColor !bg-transparent data-[hover=true]:!bg-primaryThemeColor/10 data-[selectable=true]:focus:!bg-primaryThemeColor/10 data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!text-primaryTextColor",
                },
              }}
              popoverProps={{
                classNames: {
                  content: "bg-secondaryThemeColor border border-borderColor/70",
                },
              }}
            >
              {testCategories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  classNames={{
                    base: "!text-primaryTextColor !bg-transparent data-[hover=true]:!bg-primaryThemeColor/10 data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!text-primaryTextColor",
                    title: "!text-primaryTextColor group-data-[selected=true]:!text-primaryThemeColor group-data-[hover=true]:!text-primaryTextColor",
                    description: "!text-primaryTextColor",
                    selectedIcon: "!text-primaryThemeColor",
                  }}
                >
                  {category}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* جستجو */}
          <div className="w-full relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو بین تست ها..."
              className="w-full h-12 pr-12 pl-4 rounded-xl bg-secondaryThemeColor text-primaryTextColor placeholder-secondaryTextColor/70 border border-borderColor focus:outline-none focus:ring-2 focus:ring-primaryThemeColor/30 focus:border-primaryThemeColor/40 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-lg bg-darkThemeColor text-secondaryTextColor flex items-center justify-center border border-borderColor">
              <i className="fi fi-rr-search h-4"></i>
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="clear"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryTextColor hover:text-primaryThemeColor transition-colors"
              >
                <i className="fi fi-rr-cross-small h-5"></i>
              </button>
            )}
          </div>
        </div>

        {/* نمایش گروهی یا فیلتر شده */}
        {groupedTests ? (
          // نمایش گروه‌بندی شده
          <div className="w-full flex flex-col gap-8">
            {Object.entries(groupedTests).map(([category, tests]) => (
              <div key={category} className="w-full flex flex-col gap-4">
                {/* عنوان دسته */}
                <div className="flex items-center gap-3 pb-2 border-b border-primaryThemeColor/20">
                  <div className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/30">
                    <i className="fi fi-rr-category text-sm block h-[14px]"></i>
                  </div>
                  <h2 className="text-xl font-bold text-primaryTextColor">
                    {category}
                  </h2>
                  <span className="text-secondaryTextColor text-sm mr-auto">
                    {toFarsiNumber(tests.length)} تست
                  </span>
                </div>

                {/* تست‌های این دسته */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tests.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link || "#"}
                      className="w-full group"
                    >
                      <div className="w-full h-48 rounded-2xl p-4 bg-gradient-to-b from-[#222529] to-[#1c1e21] border border-borderColor/60 hover:border-primaryThemeColor/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_2px_rgba(23,201,100,0.08)] flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-primaryTextColor text-sm font-semibold line-clamp-2 leading-5">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-secondaryTextColor text-xs line-clamp-3 leading-5 flex-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-primaryThemeColor text-xs font-medium">
                            شروع تست
                          </span>
                          <i className="fi fi-rr-arrow-left text-primaryThemeColor text-sm"></i>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // نمایش فیلتر شده (grid ساده)
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={item.link || "#"}
                className="w-full group"
              >
                <div className="w-full h-48 rounded-2xl p-4 bg-gradient-to-b from-[#222529] to-[#1c1e21] border border-borderColor/60 hover:border-primaryThemeColor/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_2px_rgba(23,201,100,0.08)] flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-primaryTextColor text-sm font-semibold line-clamp-2 leading-5">
                        {item.title}
                      </h3>
                      <span className="text-primaryThemeColor text-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-secondaryTextColor text-xs line-clamp-3 leading-5 flex-1">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primaryThemeColor text-xs font-medium">
                      شروع تست
                    </span>
                    <i className="fi fi-rr-arrow-left text-primaryThemeColor text-sm"></i>
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="size-16 rounded-full bg-secondaryThemeColor flex items-center justify-center mb-4">
                  <i className="fi fi-rr-search text-2xl text-secondaryTextColor"></i>
                </div>
                <span className="text-secondaryTextColor text-lg">موردی یافت نشد</span>
                <span className="text-secondaryTextColor/70 text-sm mt-1">
                  سعی کنید کلمات کلیدی دیگری جستجو کنید
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Page;
