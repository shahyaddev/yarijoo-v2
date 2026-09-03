"use client";
import React, { useState, useEffect } from "react";
import { Radio, RadioGroup } from "@nextui-org/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { baseURL } from "@/services/API";

const StorySidebar = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [popularTopics, setPopularTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fetch popular topics
    const fetchPopularTopics = async () => {
      try {
        const response = await fetch(`${baseURL}/story/topics/popular?limit=6`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setPopularTopics(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Error fetching popular topics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTopics();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category_slug");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("category_slug", value);
    } else {
      params.delete("category_slug");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // clear all filters
  const clearAllFiltersHandler = () => {
    setSelectedCategory("");
    router.push(pathname);
  };

  // check if any filter is active
  const hasActiveFilters = 
    searchParams.get("category_slug") || 
    searchParams.get("only_popular_topics") ||
    searchParams.get("mood_slugs");

  const categories = [
    { id: 1, name: "همه داستان‌ها", slug: "all" },
    { id: 2, name: "موفقیت و پیروزی", slug: "success" },
    { id: 3, name: "غلبه بر افسردگی", slug: "depression" },
    { id: 4, name: "رهایی از اضطراب", slug: "anxiety" },
    { id: 5, name: "بهبود روابط", slug: "relationships" },
    { id: 6, name: "خودشناسی", slug: "self-awareness" },
  ];

  return (
    <div className="w-[280px] shrink-0 lg:flex hidden flex-col gap-4 sticky top-24">
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

      {/* Categories */}
      <div className="w-full rounded-2xl flex flex-col gap-2 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-apps h-4"></i>
          <span className="text-sm font-bold">دسته‌بندی داستان‌ها</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 flex flex-col gap-4">
          <RadioGroup
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            classNames={{ wrapper: "gap-4" }}
          >
            <Radio
              classNames={{
                control: "!bg-primaryThemeColor",
                wrapper:
                  "border-secondaryTextColor group-data-[selected=true]:!border-primaryThemeColor group-data-[hover-unselected=true]:!bg-[#444]",
                label: "!text-secondaryTextColor",
              }}
              value="all"
            >
              همه داستان‌ها
            </Radio>
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

      {/* Popular Tags */}
      <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-tags h-4"></i>
          <span className="text-sm font-bold">موضوعات محبوب</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 flex flex-wrap gap-2">
          {loading ? (
            <div className="text-secondaryTextColor text-sm">در حال بارگذاری...</div>
          ) : popularTopics.length > 0 ? (
            popularTopics.map((topic) => {
              const isSelected = searchParams.get("only_popular_topics") === "1";
              return (
                <button
                  key={topic.id || topic.slug}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (isSelected) {
                      params.delete("only_popular_topics");
                    } else {
                      params.set("only_popular_topics", "1");
                    }
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                    isSelected
                      ? "bg-primaryThemeColor text-white border-primaryThemeColor"
                      : "bg-primaryThemeColor/10 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-white border-primaryThemeColor/20"
                  }`}
                >
                  {topic.name || topic.title}
                </button>
              );
            })
          ) : (
            <div className="text-secondaryTextColor text-sm">موضوعی یافت نشد</div>
          )}
        </div>
      </div>

      {/* Reading Moods */}
      <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-mood-smile h-4"></i>
          <span className="text-sm font-bold">حال و هوا</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 space-y-2">
          {["😊 انگیزشی", "😌 آرام‌بخش", "💪 قدرت‌بخش", "❤️ احساسی", "🌟 الهام‌بخش"].map((mood) => (
            <button
              key={mood}
              className="w-full text-right px-3 py-2 text-sm rounded-lg text-secondaryTextColor hover:text-primaryTextColor hover:bg-darkThemeColor/50 transition-all"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorySidebar;


