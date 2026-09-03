"use client";

import CustomLoading from "@/components/shared/CustomLoading";
import { Checkbox, Radio, RadioGroup } from "@nextui-org/react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { baseURL } from "@/services/API";

const PopularTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${baseURL}/blog/tag/popular?limit=12&featured_only=0`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setTags(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Error fetching popular tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

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

  if (loading) {
    return <div className="text-secondaryTextColor text-sm">در حال بارگذاری...</div>;
  }

  if (tags.length === 0) {
    return <div className="text-secondaryTextColor text-sm">تگی یافت نشد</div>;
  }

  return (
    <>
      {tags.map((tag) => {
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
      })}
    </>
  );
};

const Sidebar = ({ categories }) => {
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category");

  useEffect(() => {
    setSearchVal(search || "");
    setSelectedCategory(category || "");
  }, [search, category]);

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

  const setSearchParamHandler = (e) => {
    e.preventDefault();

    startTransition(() => {
      router.push(pathname + "?" + createQueryString("search", searchVal));
    });
  };

  const clearSearchHandler = () => {
    setSearchVal("");
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("search", ""));
    });
  };

  const setCategoryParamHandler = (slug) => {
    setSelectedCategory(slug);

    startTransition(() => {
      router.push(pathname + "?" + createQueryString("category", slug));
    });
  };

  const clearAllFiltersHandler = () => {
    setSearchVal("");
    setSelectedCategory("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = searchVal || selectedCategory;

  return (
    <>
      <CustomLoading isLoading={isPending} />
      
      <div className="w-[260px] lg:flex hidden flex-col gap-4 sticky top-24">
        {/* search */}
        <form
          onSubmit={setSearchParamHandler}
          className="w-full h-16 relative rounded-2xl border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114] hover:border-primaryThemeColor/40 transition-all"
        >
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            type="text"
            className="w-full h-full rounded-2xl text-primaryTextColor bg-transparent outline-none pr-12 pl-5 text-sm placeholder-secondaryTextColor/70"
            placeholder="جست و جو در مقالات..."
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

            {hasActiveFilters && (
              <button
                onClick={clearAllFiltersHandler}
                className="w-full mt-2 h-10 rounded-xl bg-primaryThemeColor/10 hover:bg-primaryThemeColor/20 border border-primaryThemeColor/30 text-primaryThemeColor text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <i className="fi fi-rr-cross-small h-4"></i>
                <span>پاک کردن فیلترها</span>
              </button>
            )}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="w-full rounded-2xl flex flex-col gap-3 h-auto p-5 overflow-hidden border border-borderColor/70 bg-gradient-to-b from-[#181b1f] to-[#0f1114]">
          <div className="flex items-center text-primaryTextColor gap-2 relative pb-2">
            <i className="fi fi-rr-tags h-4"></i>
            <span className="text-sm font-bold">برچسب های محبوب</span>
            <div className="absolute w-2 h-full bg-primaryThemeColor rounded-full -right-6"></div>
          </div>

          <div className="border-t border-borderColor pt-4 flex flex-wrap gap-2">
            <PopularTags />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
