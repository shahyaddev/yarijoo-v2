"use client";

import React, { useState, useEffect } from "react";
import { saveBlog, removeBlog, isBlogSaved } from "@/helper/bookmarkHelper";
import { useUser } from "@/lib/useUser";
import toast from "react-hot-toast";

const BlogBookmarkButton = ({ blog }) => {
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
      
      const blogId = blog?.id || blog?.details?.id;
      if (blogId) {
        try {
          setChecking(true);
          const saved = await isBlogSaved(blogId);
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
  }, [blog, user?.user?.id]);

  const handleBookmark = async () => {
    if (!user?.user?.id) {
      toast.error("ابتدا وارد حساب خود شوید", { duration: 4500 });
      return;
    }

    if (!blog) return;

    const blogId = blog?.id || blog?.details?.id;
    if (!blogId) return;

    setLoading(true);

    try {
      if (isBookmarked) {
        const success = await removeBlog(blogId);
        if (success) {
          setIsBookmarked(false);
          toast.success("مقاله از ذخیره شده‌ها حذف شد");
        }
      } else {
        const success = await saveBlog(blog);
        if (success) {
          setIsBookmarked(true);
          toast.success("مقاله به ذخیره شده‌ها اضافه شد");
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
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border group ${
        isBookmarked
          ? "bg-primaryThemeColor/20 text-primaryThemeColor border-primaryThemeColor/30"
          : "bg-darkThemeColor/30 hover:bg-darkThemeColor/50 text-secondaryTextColor hover:text-primaryTextColor border-borderColor/30 hover:border-primaryThemeColor/30"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <i className="fi fi-rr-spinner animate-spin text-primaryThemeColor h-4"></i>
      ) : (
        <i className={`fi ${isBookmarked ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-primaryThemeColor h-4 group-hover:scale-110 transition-transform`}></i>
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

export default BlogBookmarkButton;





