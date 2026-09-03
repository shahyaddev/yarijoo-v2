"use client";

import React, { useState, useEffect } from "react";
import { saveStory, removeStory, isStorySaved } from "@/helper/bookmarkHelper";
import { useUser } from "@/lib/useUser";
import toast from "react-hot-toast";

const StoryBookmarkButton = ({ story }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const user = useUser();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user?.user?.id) {
        setChecking(false);
        return;
      }
      
      if (story?.id) {
        try {
          setChecking(true);
          const saved = await isStorySaved(story.id);
          setIsBookmarked(saved);
        } catch (error) {
          console.error("Error checking bookmark:", error);
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };

    checkBookmarkStatus();
  }, [story?.id, user?.user?.id]);

  const handleBookmark = async () => {
    if (!user?.user?.id) {
      toast.error("ابتدا وارد حساب خود شوید", { duration: 4500 });
      return;
    }

    if (!story) return;

    setLoading(true);

    try {
      if (isBookmarked) {
        const success = await removeStory(story.id);
        if (success) {
          setIsBookmarked(false);
          toast.success("داستان از ذخیره شده‌ها حذف شد");
        }
      } else {
        const success = await saveStory(story);
        if (success) {
          setIsBookmarked(true);
          toast.success("داستان به ذخیره شده‌ها اضافه شد");
        }
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all border bg-darkThemeColor/30 text-secondaryTextColor border-borderColor/30"
      >
        <i className="fi fi-rr-spinner animate-spin text-primaryThemeColor h-4"></i>
        <span className="text-sm font-semibold">در حال بررسی...</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
        isBookmarked
          ? "bg-primaryThemeColor/20 text-primaryThemeColor border-primaryThemeColor/30"
          : "bg-darkThemeColor/30 hover:bg-darkThemeColor/50 text-secondaryTextColor hover:text-primaryTextColor border-borderColor/30 hover:border-primaryThemeColor/30"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <i className="fi fi-rr-spinner animate-spin text-primaryThemeColor h-4"></i>
      ) : (
        <i className={`fi ${isBookmarked ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-primaryThemeColor h-4`}></i>
      )}
      <span className="text-sm font-semibold">
        {loading 
          ? "در حال پردازش..." 
          : isBookmarked 
          ? "حذف از ذخیره شده‌ها" 
          : "افزودن به علاقه‌مندی‌ها"}
      </span>
    </button>
  );
};

export default StoryBookmarkButton;

