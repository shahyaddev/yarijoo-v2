"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import Footer from "@/components/footer/Footer";
import BlogCard from "@/components/blog/BlogCard";
import BookCard from "@/components/book/BookCard";
import StoryCard from "@/components/stories/StoryCard";
import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { toFarsiNumber } from "@/helper/helper";
import { fetchBookmarks, removeBookmark } from "@/helper/bookmarkHelper";
import { useUser } from "@/lib/useUser";
import toast, { Toaster } from "react-hot-toast";

const Page = () => {
  const user = useUser();
  const [savedItems, setSavedItems] = useState({
    blogs: [],
    stories: [],
    books: [],
  });
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ذخیره شده‌ها - یاریجو";
  }, []);

  useEffect(() => {
    const loadSavedItems = async () => {
      if (!user?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allBookmarks = await fetchBookmarks();
        
        // Transform API response to match component structure
        const blogs = allBookmarks
          .filter(b => b.type === "article")
          .map(b => b.item || {});
        
        const stories = allBookmarks
          .filter(b => b.type === "story")
          .map(b => b.item || {});
        
        const books = allBookmarks
          .filter(b => b.type === "book")
          .map(b => b.item || {});

        setSavedItems({
          blogs,
          stories,
          books,
        });
      } catch (error) {
        console.error("Error loading saved items:", error);
        toast.error("خطا در بارگذاری ذخیره شده‌ها");
      } finally {
        setLoading(false);
      }
    };

    loadSavedItems();

    // Listen for bookmark updates
    const handleBookmarkUpdate = () => {
      loadSavedItems();
    };

    window.addEventListener("bookmarkUpdated", handleBookmarkUpdate);
    return () => window.removeEventListener("bookmarkUpdated", handleBookmarkUpdate);
  }, [user?.user?.id]);

  const removeItem = async (type, id) => {
    if (!user?.user?.id) {
      toast.error("ابتدا وارد حساب خود شوید");
      return;
    }

    try {
      const typeMap = {
        blogs: "article",
        stories: "story",
        books: "book",
      };

      const apiType = typeMap[type];
      if (!apiType) return;

      const success = await removeBookmark(apiType, id);
      if (success) {
        // Update local state
        setSavedItems((prev) => ({
          ...prev,
          [type]: prev[type].filter((item) => item.id !== id),
        }));
        
        const typeNames = {
          blogs: "مقاله",
          stories: "داستان",
          books: "کتاب",
        };
        
        toast.success(`${typeNames[type]} از ذخیره شده‌ها حذف شد`);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("خطا در حذف آیتم");
    }
  };

  const totalCount = savedItems.blogs.length + savedItems.stories.length + savedItems.books.length;

  const filteredItems = {
    all: {
      blogs: savedItems.blogs,
      stories: savedItems.stories,
      books: savedItems.books,
    },
    blogs: {
      blogs: savedItems.blogs,
      stories: [],
      books: [],
    },
    stories: {
      blogs: [],
      stories: savedItems.stories,
      books: [],
    },
    books: {
      blogs: [],
      stories: [],
      books: savedItems.books,
    },
  };

  const currentItems = filteredItems[selectedTab];

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Toaster position="top-center" />
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Page Header */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
            <h1 className="text-2xl font-black text-primaryTextColor">ذخیره شده‌ها</h1>
            <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
            <span className="text-sm text-secondaryTextColor">
              {toFarsiNumber(totalCount)} مورد
            </span>
          </div>

          {/* Tabs */}
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key)}
            classNames={{
              base: "w-full",
              tabList: "bg-secondaryThemeColor border border-borderColor/60 rounded-2xl p-1 gap-1",
              tab: "!bg-transparent data-[selected=true]:!bg-primaryThemeColor/20 data-[selected=true]:!text-primaryThemeColor data-[hover=true]:!bg-primaryThemeColor/10 rounded-xl min-w-fit px-4 h-10",
              tabContent: "text-secondaryTextColor group-data-[selected=true]:!text-primaryThemeColor text-sm font-semibold",
              cursor: "!bg-primaryThemeColor/20 rounded-xl",
              panel: "hidden",
            }}
          >
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-apps h-4"></i>
                  <span>همه ({toFarsiNumber(totalCount)})</span>
                </div>
              }
            />
            <Tab
              key="blogs"
              title={
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-document h-4"></i>
                  <span>مقالات ({toFarsiNumber(savedItems.blogs.length)})</span>
                </div>
              }
            />
            <Tab
              key="stories"
              title={
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-book-open-cover h-4"></i>
                  <span>داستان‌ها ({toFarsiNumber(savedItems.stories.length)})</span>
                </div>
              }
            />
            <Tab
              key="books"
              title={
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-book h-4"></i>
                  <span>کتاب‌ها ({toFarsiNumber(savedItems.books.length)})</span>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Content */}
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
              <i className="fi fi-rr-spinner animate-spin text-4xl text-primaryThemeColor h-10"></i>
            </div>
            <p className="text-xl font-bold text-primaryTextColor mb-2">
              در حال بارگذاری...
            </p>
          </div>
        ) : !user?.user?.id ? (
          <div className="w-full flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
              <i className="fi fi-rr-user-lock text-4xl text-secondaryTextColor h-10"></i>
            </div>
            <p className="text-xl font-bold text-primaryTextColor mb-2">
              برای مشاهده ذخیره شده‌ها وارد حساب خود شوید
            </p>
            <p className="text-secondaryTextColor text-center max-w-md">
              پس از ورود، می‌توانید مقالات، داستان‌ها و کتاب‌های مورد علاقه خود را مشاهده کنید
            </p>
          </div>
        ) : totalCount === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
              <i className="fi fi-rr-bookmark text-4xl text-secondaryTextColor h-10"></i>
            </div>
            <p className="text-xl font-bold text-primaryTextColor mb-2">
              هنوز چیزی ذخیره نکرده‌اید!
            </p>
            <p className="text-secondaryTextColor text-center max-w-md">
              می‌توانید مقالات، داستان‌ها و کتاب‌های مورد علاقه خود را ذخیره کنید
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8">
            {/* Blogs Section */}
            {currentItems.blogs.length > 0 && (
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-2 border-b border-primaryThemeColor/20">
                  <div className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/30">
                    <i className="fi fi-rr-document text-sm block h-[14px]"></i>
                  </div>
                  <h2 className="text-xl font-bold text-primaryTextColor">
                    مقالات ذخیره شده
                  </h2>
                  <span className="text-secondaryTextColor text-sm mr-auto">
                    {toFarsiNumber(currentItems.blogs.length)} مقاله
                  </span>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.blogs.map((blog) => (
                    <div key={blog.id} className="relative group">
                      <BlogCard data={blog} />
                      <button
                        onClick={() => removeItem("blogs", blog.id)}
                        className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 z-10"
                        title="حذف از ذخیره شده‌ها"
                      >
                        <i className="fi fi-rr-cross-small h-4"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stories Section */}
            {currentItems.stories.length > 0 && (
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-2 border-b border-pink-500/20">
                  <div className="size-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/30">
                    <i className="fi fi-rr-book-open-cover text-sm block h-[14px]"></i>
                  </div>
                  <h2 className="text-xl font-bold text-primaryTextColor">
                    داستان‌های ذخیره شده
                  </h2>
                  <span className="text-secondaryTextColor text-sm mr-auto">
                    {toFarsiNumber(currentItems.stories.length)} داستان
                  </span>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentItems.stories.map((story) => (
                    <div key={story.id} className="relative group">
                      <StoryCard data={story} />
                      <button
                        onClick={() => removeItem("stories", story.id)}
                        className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 z-10"
                        title="حذف از ذخیره شده‌ها"
                      >
                        <i className="fi fi-rr-cross-small h-4"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Books Section */}
            {currentItems.books.length > 0 && (
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-2 border-b border-primaryThemeColor/20">
                  <div className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/30">
                    <i className="fi fi-rr-book text-sm block h-[14px]"></i>
                  </div>
                  <h2 className="text-xl font-bold text-primaryTextColor">
                    کتاب‌های ذخیره شده
                  </h2>
                  <span className="text-secondaryTextColor text-sm mr-auto">
                    {toFarsiNumber(currentItems.books.length)} کتاب
                  </span>
                </div>
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                  {currentItems.books.map((book) => (
                    <div key={book.id} className="relative group">
                      <BookCard data={book} />
                      <button
                        onClick={() => removeItem("books", book.id)}
                        className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 z-10"
                        title="حذف از ذخیره شده‌ها"
                      >
                        <i className="fi fi-rr-cross-small h-4"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Selected Tab */}
            {currentItems.blogs.length === 0 &&
              currentItems.stories.length === 0 &&
              currentItems.books.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
                    <i className="fi fi-rr-search text-4xl text-secondaryTextColor h-10"></i>
                  </div>
                  <p className="text-xl font-bold text-primaryTextColor mb-2">
                    موردی در این دسته‌بندی یافت نشد
                  </p>
                  <p className="text-secondaryTextColor">
                    می‌توانید از سایر دسته‌بندی‌ها استفاده کنید
                  </p>
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

