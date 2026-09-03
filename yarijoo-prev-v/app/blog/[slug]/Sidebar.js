"use client";
import { toFarsiNumber } from "@/helper/helper";
import React, { useState, useContext, useEffect } from "react";
import SocialShare from "@/components/blog/SocialShare";
import { FontSizeContext } from "./BlogContentWrapper";
import { saveBlog, removeBlog, isBlogSaved } from "@/helper/bookmarkHelper";
import { useUser } from "@/lib/useUser";
import toast from "react-hot-toast";

const Sidebar = ({ postId, postTitle, postUrl, postData }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { fontSize, setFontSize } = useContext(FontSizeContext);
  const user = useUser();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user?.user?.id || !postId) {
        setChecking(false);
        return;
      }
      
      try {
        setChecking(true);
        const saved = await isBlogSaved(postId);
        setIsBookmarked(saved);
      } catch (error) {
        console.error("Error checking bookmark:", error);
      } finally {
        setChecking(false);
      }
    };

    checkBookmarkStatus();
  }, [postId, user?.user?.id]);

  const handleBookmark = async () => {
    if (!user?.user?.id) {
      toast.error("ابتدا وارد حساب خود شوید", { duration: 4500 });
      return;
    }

    if (!postData) return;
    
    setLoading(true);

    try {
      if (isBookmarked) {
        const success = await removeBlog(postId);
        if (success) {
          setIsBookmarked(false);
          toast.success("مقاله از ذخیره شده‌ها حذف شد");
        }
      } else {
        const success = await saveBlog(postData);
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

  const handleReport = async () => {
    setIsReporting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsReporting(false);
    setReportSubmitted(true);
    setTimeout(() => setReportSubmitted(false), 3000);
  };

  const handleFontSizeChange = () => {
    const sizes = ["sm", "base", "lg", "xl"];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  const getFontSizeLabel = () => {
    const labels = {
      sm: "کوچک",
      base: "متوسط",
      lg: "بزرگ",
      xl: "خیلی بزرگ",
    };
    return labels[fontSize] || "متوسط";
  };
  return (
    <div className="w-[280px] shrink-0 hidden lg:flex flex-col gap-4 sticky top-24">
      {/* share */}
      <div className="w-full rounded-2xl flex flex-col gap-4 bg-secondaryThemeColor overflow-hidden p-5 border border-borderColor/60">
        <div className="flex items-center text-primaryTextColor font-black gap-2 relative pb-3 border-b border-borderColor">
          <i className="fi fi-rr-share text-xl h-5"></i>
          <span className="text-base">اشتراک گذاری</span>
          <div className="absolute w-2 h-7 bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <SocialShare title={postTitle || "مقاله یاریجو"} url={postUrl} />
      </div>

      {/* Quick Actions */}
      <div className="w-full rounded-2xl flex flex-col gap-3 bg-secondaryThemeColor overflow-hidden p-5 border border-borderColor/60">
        <div className="flex items-center text-primaryTextColor font-black gap-2 relative pb-3 border-b border-borderColor">
          <i className="fi fi-rr-bolt text-xl h-5"></i>
          <span className="text-base">عملیات سریع</span>
          <div className="absolute w-2 h-7 bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            disabled={loading || checking}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
              isBookmarked
                ? "bg-primaryThemeColor/20 text-primaryThemeColor border-primaryThemeColor/30"
                : "bg-darkThemeColor/50 text-secondaryTextColor hover:bg-primaryThemeColor/10 hover:text-primaryThemeColor border-borderColor/30 hover:border-primaryThemeColor/30"
            } ${loading || checking ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading || checking ? (
              <>
                <i className="fi fi-rr-spinner animate-spin text-lg h-4"></i>
                <span className="text-sm font-semibold">
                  {checking ? "در حال بررسی..." : "در حال پردازش..."}
                </span>
              </>
            ) : (
              <>
                <i className={`fi ${isBookmarked ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-lg h-4`}></i>
                <span className="text-sm font-semibold">
                  {isBookmarked ? "حذف از ذخیره شده‌ها" : "ذخیره مقاله"}
                </span>
              </>
            )}
          </button>

          {/* Report */}
          <button
            onClick={handleReport}
            disabled={isReporting || reportSubmitted}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-darkThemeColor/50 
                     text-secondaryTextColor hover:bg-red-500/10 hover:text-red-500 
                     transition-all border border-borderColor/30 hover:border-red-500/30
                     disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isReporting ? (
              <>
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">در حال ثبت...</span>
              </>
            ) : reportSubmitted ? (
              <>
                <i className="fi fi-rr-check text-lg h-4 text-green-500"></i>
                <span className="text-sm font-semibold text-green-500">
                  گزارش شما ثبت شد
                </span>
              </>
            ) : (
              <>
                <i className="fi fi-rr-flag text-lg h-4"></i>
                <span className="text-sm font-semibold">گزارش مشکل</span>
              </>
            )}
          </button>

          {/* Font Size */}
          <button
            onClick={handleFontSizeChange}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-darkThemeColor/50 
                     text-secondaryTextColor hover:bg-primaryThemeColor/10 hover:text-primaryThemeColor 
                     transition-all border border-borderColor/30 hover:border-primaryThemeColor/30"
          >
            <div className="flex items-center gap-3">
              <i className="fi fi-rr-text text-lg h-4"></i>
              <span className="text-sm font-semibold">اندازه متن</span>
            </div>
            <span className="text-xs text-primaryThemeColor">
              {getFontSizeLabel()}
            </span>
          </button>
        </div>
      </div>

      {/* Reading Stats */}
      <div className="w-full rounded-2xl flex flex-col gap-3 bg-secondaryThemeColor overflow-hidden p-5 border border-borderColor/60">
        <div className="flex items-center text-primaryTextColor font-black gap-2 relative pb-3 border-b border-borderColor">
          <i className="fi fi-rr-chart-line-up text-xl h-5"></i>
          <span className="text-base">آمار مقاله</span>
          <div className="absolute w-2 h-7 bg-primaryThemeColor rounded-full -right-6"></div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryTextColor">کل بازدید</span>
            <span className="text-sm font-bold text-primaryThemeColor">
              {toFarsiNumber(123)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryTextColor">امتیاز</span>
            <span className="text-sm font-bold text-primaryThemeColor">
              ۴.۵ / ۵
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryTextColor">تعداد نظرات</span>
            <span className="text-sm font-bold text-primaryThemeColor">
              {toFarsiNumber(15)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
