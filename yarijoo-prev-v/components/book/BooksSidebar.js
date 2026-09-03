"use client";
import React, { useState, useEffect } from "react";
import { Radio, RadioGroup, Checkbox, CheckboxGroup } from "@nextui-org/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { baseURL } from "@/services/API";

const BooksSidebar = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fetch popular tags
    const fetchPopularTags = async () => {
      try {
        const response = await fetch(`${baseURL}/book/books/popular-tags?limit=8`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setPopularTags(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Error fetching popular tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTags();
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

  const handleTagClick = (tagSlug) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.get("tag_slugs")?.split(",").filter(Boolean) || [];
    
    if (currentTags.includes(tagSlug)) {
      const newTags = currentTags.filter(t => t !== tagSlug);
      if (newTags.length > 0) {
        params.set("tag_slugs", newTags.join(","));
      } else {
        params.delete("tag_slugs");
      }
    } else {
      params.set("tag_slugs", [...currentTags, tagSlug].join(","));
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sortValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue) {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
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
    searchParams.get("tag_slugs") || 
    searchParams.get("sort");

  const categories = [
    { id: 1, name: "همه کتاب‌ها", slug: "all" },
    { id: 2, name: "روانشناسی", slug: "psychology" },
    { id: 3, name: "خودشناسی", slug: "self-awareness" },
    { id: 4, name: "رشد فردی", slug: "personal-growth" },
    { id: 5, name: "روابط", slug: "relationships" },
    { id: 6, name: "کودک و نوجوان", slug: "children" },
  ];

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

      {/* Categories */}
      <div className="w-full rounded-2xl flex flex-col gap-2 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-apps h-4"></i>
          <span className="text-sm font-bold">دسته‌بندی کتاب‌ها</span>
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
              همه کتاب‌ها
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

      {/* Filters */}
      <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-filter h-4"></i>
          <span className="text-sm font-bold">فیلترها</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 flex flex-col gap-4">
          {[
            { label: "پرفروش‌ترین‌ها", value: "price_desc" },
            { label: "ارزان‌ترین", value: "price_asc" },
            { label: "جدیدترین", value: "created_desc" },
            { label: "قدیمی‌ترین", value: "created_asc" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                const currentSort = searchParams.get("sort");
                if (currentSort === filter.value) {
                  handleSortChange("");
                } else {
                  handleSortChange(filter.value);
                }
              }}
              className={`text-right px-3 py-2 rounded-lg text-sm transition-all ${
                searchParams.get("sort") === filter.value
                  ? "bg-primaryThemeColor/20 text-primaryThemeColor border border-primaryThemeColor/30"
                  : "text-secondaryTextColor hover:text-primaryTextColor hover:bg-darkThemeColor/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
        <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
          <i className="fi fi-rr-tags h-4"></i>
          <span className="text-sm font-bold">تگ‌های محبوب</span>
          <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="border-t border-borderColor pt-4 flex flex-wrap gap-2">
          {loading ? (
            <div className="text-secondaryTextColor text-sm">در حال بارگذاری...</div>
          ) : popularTags.length > 0 ? (
            popularTags.map((tag) => {
              const isSelected = searchParams.get("tag_slugs")?.split(",").includes(tag.slug || tag.id?.toString());
              return (
                <button
                  key={tag.id || tag.slug}
                  onClick={() => handleTagClick(tag.slug || tag.id?.toString())}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                    isSelected
                      ? "bg-primaryThemeColor text-darkThemeColor border-primaryThemeColor"
                      : "bg-primaryThemeColor/10 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor border-primaryThemeColor/20"
                  }`}
                >
                  {tag.name || tag.title}
                </button>
              );
            })
          ) : (
            <div className="text-secondaryTextColor text-sm">تگی یافت نشد</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksSidebar;
