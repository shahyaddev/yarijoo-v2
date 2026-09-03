"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import { psychologicalTests, testCategories } from "./psychologicalTestsData";
import { baseURL } from "@/services/API";


const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTests, setCompletedTests] = useState([]);

  // دریافت تست‌های انجام شده کاربر
  useEffect(() => {
    const fetchCompletedTests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const testsRes = await fetch(`${baseURL}/tests/complete-history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (testsRes.ok) {
          const contentType = testsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const testsData = await testsRes.json();
            if (testsData.success && testsData.data?.history) {
              const completedTestNames = Object.keys(testsData.data.history);
              setCompletedTests(completedTestNames);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching completed tests:", error);
      }
    };

    fetchCompletedTests();
  }, []);

  // Filter tests based on category and search query
  const filteredTests = useMemo(() => {
    let filtered = psychologicalTests;

    // Filter by category
    if (selectedCategory !== "همه") {
      filtered = filtered.filter((test) => test.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query) ||
          test.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Group tests by category when "همه" is selected and no search query
  const groupedTests = useMemo(() => {
    if (selectedCategory !== "همه" || searchQuery.trim()) {
      return null;
    }

    const grouped = {};
    psychologicalTests.forEach((test) => {
      if (!grouped[test.category]) {
        grouped[test.category] = [];
      }
      grouped[test.category].push(test);
    });

    // Sort categories by the order in testCategories array
    const sortedCategories = testCategories
      .filter((cat) => cat !== "همه" && grouped[cat])
      .map((cat) => ({
        category: cat,
        tests: grouped[cat],
      }));

    return sortedCategories;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4 md:p-6">
          {/* Header */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-primaryTextColor">
                تست‌های روانشناسی
              </h1>
              <p className="text-sm text-secondaryTextColor">
                تست مورد نظر خود را انتخاب کنید و از نتایج دقیق و جامع بهره‌مند شوید
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <i className="fi fi-rr-search text-secondaryTextColor text-lg"></i>
              </div>
              <input
                type="text"
                placeholder="جستجوی تست (عنوان، توضیحات، دسته‌بندی)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pr-12 pl-4 bg-darkThemeColor border border-borderColor/30 rounded-xl text-primaryTextColor placeholder-secondaryTextColor focus:outline-none focus:border-primaryThemeColor/50 focus:ring-2 focus:ring-primaryThemeColor/20 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-secondaryTextColor hover:text-primaryThemeColor transition-colors"
                >
                  <i className="fi fi-rr-cross-small text-lg"></i>
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="w-full flex flex-wrap gap-3 pb-2">
              {testCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2.5 min-w-fit rounded-xl flex items-center gap-2 transition-all duration-300 text-sm font-medium ${
                    selectedCategory === category
                      ? "bg-primaryThemeColor text-white shadow-lg shadow-primaryThemeColor/20"
                      : "bg-darkThemeColor text-primaryTextColor hover:bg-darkThemeColor/80 border border-borderColor/30"
                  }`}
                >
                  {category === "همه" && (
                    <i className="fi fi-rr-apps text-base"></i>
                  )}
                  <span>{category}</span>
                  {category !== "همه" && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg ${
                        selectedCategory === category
                          ? "bg-white/20 text-white"
                          : "bg-primaryThemeColor/15 text-primaryThemeColor"
                      }`}
                    >
                      {
                        psychologicalTests.filter((t) => t.category === category)
                          .length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {filteredTests.length > 0 && (
            <div className="w-full flex items-center gap-2 text-sm text-secondaryTextColor">
              <i className="fi fi-rr-info text-base"></i>
              <span>
                {filteredTests.length} تست یافت شد
                {selectedCategory !== "همه" && ` در دسته "${selectedCategory}"`}
                {searchQuery.trim() && ` برای "${searchQuery}"`}
              </span>
            </div>
          )}

          {/* Tests Grid */}
          {filteredTests.length > 0 ? (
            <>
              {groupedTests ? (
                // Show grouped by category
                <div className="w-full flex flex-col gap-8">
                  {groupedTests.map(({ category, tests }) => (
                    <div key={category} className="w-full flex flex-col gap-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-borderColor/20">
                        <h2 className="text-xl font-bold text-primaryTextColor">
                          {category}
                        </h2>
                        <span className="text-sm text-secondaryTextColor">
                          ({tests.length} تست)
                        </span>
                      </div>
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tests.map((item) => {
                          const isCompleted = completedTests.includes(item.id);
                          return (
                            <Link
                              key={item.id}
                              href={item.link || "#"}
                              className="w-full group relative"
                            >
                              {isCompleted && (
                                <div className="absolute -top-2 -right-2 z-10 size-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                  <i className="fi fi-sr-check text-white text-xs"></i>
                                </div>
                              )}
                              <div className={`w-full h-40 rounded-2xl p-4 bg-gradient-to-b from-[#222529] to-[#1c1e21] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_2px_rgba(23,201,100,0.08)] flex flex-col gap-3 ${
                                isCompleted 
                                  ? "border-green-500/50 hover:border-green-500/70" 
                                  : "border-borderColor/60 hover:border-primaryThemeColor/40"
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${
                                    isCompleted
                                      ? "bg-green-500/15 text-green-500 border-green-500/30"
                                      : "bg-primaryThemeColor/15 text-primaryThemeColor border-primaryThemeColor/20"
                                  }`}>
                                    {item.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-primaryTextColor text-sm font-semibold line-clamp-2 leading-5">
                                      {item.title}
                                    </h3>
                                    <span className="text-primaryThemeColor text-xs">
                                      {item.category}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-secondaryTextColor text-xs line-clamp-2 leading-4 flex-1">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-medium ${
                                    isCompleted ? "text-green-500" : "text-primaryThemeColor"
                                  }`}>
                                    {isCompleted ? "مشاهده نتیجه" : "شروع تست"}
                                  </span>
                                  <i className={`fi fi-rr-arrow-left text-sm ${
                                    isCompleted ? "text-green-500" : "text-primaryThemeColor"
                                  }`}></i>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show filtered list
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTests.map((item) => {
                    const isCompleted = completedTests.includes(item.id);
                    return (
                      <Link
                        key={item.id}
                        href={item.link || "#"}
                        className="w-full group relative"
                      >
                        {isCompleted && (
                          <div className="absolute -top-2 -right-2 z-10 size-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <i className="fi fi-sr-check text-white text-xs"></i>
                          </div>
                        )}
                        <div className={`w-full h-40 rounded-2xl p-4 bg-gradient-to-b from-[#222529] to-[#1c1e21] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_2px_rgba(23,201,100,0.08)] flex flex-col gap-3 ${
                          isCompleted 
                            ? "border-green-500/50 hover:border-green-500/70" 
                            : "border-borderColor/60 hover:border-primaryThemeColor/40"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${
                              isCompleted
                                ? "bg-green-500/15 text-green-500 border-green-500/30"
                                : "bg-primaryThemeColor/15 text-primaryThemeColor border-primaryThemeColor/20"
                            }`}>
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-primaryTextColor text-sm font-semibold line-clamp-2 leading-5">
                                {item.title}
                              </h3>
                              <span className="text-primaryThemeColor text-xs">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-secondaryTextColor text-xs line-clamp-2 leading-4 flex-1">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${
                              isCompleted ? "text-green-500" : "text-primaryThemeColor"
                            }`}>
                              {isCompleted ? "مشاهده نتیجه" : "شروع تست"}
                            </span>
                            <i className={`fi fi-rr-arrow-left text-sm ${
                              isCompleted ? "text-green-500" : "text-primaryThemeColor"
                            }`}></i>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="w-full flex flex-col items-center justify-center gap-6 py-12 md:py-16">
              <div className="w-24 h-24 rounded-full bg-darkThemeColor flex items-center justify-center">
                <i className="fi fi-rr-search-alt text-4xl text-secondaryTextColor"></i>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-lg font-semibold text-primaryTextColor">
                  تستی یافت نشد
                </span>
                <p className="text-sm text-secondaryTextColor max-w-md">
                  متأسفانه هیچ تستی مطابق با جستجوی شما یافت نشد. لطفاً عبارت جستجوی دیگری را امتحان کنید یا دسته‌بندی دیگری را انتخاب کنید.
                </p>
              </div>
              {(searchQuery || selectedCategory !== "همه") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("همه");
                  }}
                  className="mt-2 px-6 py-3 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors flex items-center gap-2"
                >
                  <i className="fi fi-rr-refresh text-base"></i>
                  <span>پاک کردن فیلترها</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;