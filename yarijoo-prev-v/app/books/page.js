import BookCard from "@/components/book/BookCard";
import BooksHero from "@/components/book/BooksHero";
import BooksSidebar from "@/components/book/BooksSidebar";
import BooksPagination from "@/components/book/BooksPagination";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import { toFarsiNumber } from "@/helper/helper";
import { baseURL } from "@/services/API";
import React from "react";

export const metadata = {
  title: "یاریجو - کتابخانه دیجیتال",
  description: "کتاب های تخصصی روانشناسی، خودشناسی و رشد فردی",
};

export const dynamic = "force-dynamic";

const Page = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page)
    : 1;

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (resolvedSearchParams?.search) params.append("search", resolvedSearchParams.search);
      if (resolvedSearchParams?.category_slug) params.append("category_slug", resolvedSearchParams.category_slug);
      if (resolvedSearchParams?.tag_slugs) params.append("tag_slugs", resolvedSearchParams.tag_slugs);
      if (resolvedSearchParams?.only_popular_tags) params.append("only_popular_tags", resolvedSearchParams.only_popular_tags);
      if (resolvedSearchParams?.sort) params.append("sort", resolvedSearchParams.sort);
      params.append("per_page", resolvedSearchParams?.per_page || "12");
      params.append("page", currentPage.toString());

      const url = `${baseURL}/book/books/filter?${params.toString()}`;
      const booksRes = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      if (!booksRes.ok) {
        throw new Error(`HTTP error! status: ${booksRes.status}`);
      }

      const data = await booksRes.json();

      // Check if data is an array or has a data property
      if (Array.isArray(data)) {
        return { data: data, total: data.length };
      } else if (data && Array.isArray(data.data)) {
        return { data: data.data, total: data.total || data.data.length };
      } else if (data && typeof data === "object") {
        // If it's an object, convert to array
        const items = Object.values(data).filter(
          (item) => item && typeof item === "object" && item.id
        );
        return { data: items, total: items.length };
      }

      return { data: [], total: 0 };
    } catch (error) {
      console.error("Error fetching books:", error);
      return { data: [], total: 0 };
    }
  };

  const { data: books, total } = await fetchData();
  const perPage = parseInt(resolvedSearchParams?.per_page || "12");
  const totalPages = Math.ceil(total / perPage);

  const categories = [
    {
      icon: "fi fi-rr-brain",
      name: "روانشناسی",
      count: 45,
      bgColor: "bg-primaryThemeColor/10",
      textColor: "text-primaryThemeColor",
      hoverBg: "group-hover:bg-primaryThemeColor/20",
    },
    {
      icon: "fi fi-rr-user-pen",
      name: "خودشناسی",
      count: 32,
      bgColor: "bg-primaryThemeColor/10",
      textColor: "text-primaryThemeColor",
      hoverBg: "group-hover:bg-primaryThemeColor/20",
    },
    {
      icon: "fi fi-rr-rocket-lunch",
      name: "رشد فردی",
      count: 28,
      bgColor: "bg-primaryThemeColor/10",
      textColor: "text-primaryThemeColor",
      hoverBg: "group-hover:bg-primaryThemeColor/20",
    },
    {
      icon: "fi fi-rr-heart",
      name: "روابط",
      count: 19,
      bgColor: "bg-primaryThemeColor/10",
      textColor: "text-primaryThemeColor",
      hoverBg: "group-hover:bg-primaryThemeColor/20",
    },
    {
      icon: "fi fi-rr-child-head",
      name: "کودک",
      count: 15,
      bgColor: "bg-primaryThemeColor/10",
      textColor: "text-primaryThemeColor",
      hoverBg: "group-hover:bg-primaryThemeColor/20",
    },
    {
      icon: "fi fi-rr-diploma",
      name: "آموزشی",
      count: 12,
      bgColor: "bg-primaryThemeColor/10",
      textColor: "text-primaryThemeColor",
      hoverBg: "group-hover:bg-primaryThemeColor/20",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Hero Section */}
        <BooksHero totalBooks={books.length} />

        {/* Main Content */}
        <div className="w-full flex gap-6">
          {/* Sidebar */}
          <BooksSidebar />

          {/* Books Grid */}
          <div className="w-full flex flex-col gap-6">
            {/* Section Title */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
              <h2 className="text-2xl font-black text-primaryTextColor">
                کتابخانه دیجیتال
              </h2>
              <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
              <span className="text-sm text-secondaryTextColor">
                {toFarsiNumber(total)} کتاب
              </span>
            </div>

            {/* Books Grid */}
            {books && books.length > 0 ? (
              <>
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {books.map((item, index) => (
                    <BookCard key={item.id || index} data={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <BooksPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalBooks={total}
                    perPage={perPage}
                  />
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
                  <i className="fi fi-rr-book text-4xl text-secondaryTextColor h-10"></i>
                </div>
                <p className="text-xl font-bold text-primaryTextColor mb-2">
                  کتابی موجود نیست!
                </p>
                <p className="text-secondaryTextColor">
                  به زودی کتاب‌های جدید اضافه می‌شوند
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className="flex flex-col items-center gap-3 p-5 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 hover:border-primaryThemeColor/50 transition-all cursor-pointer group"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${cat.bgColor} ${cat.hoverBg}`}
              >
                <i
                  className={`${cat.icon} text-2xl h-6 group-hover:scale-110 transition-transform ${cat.textColor}`}
                ></i>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-primaryTextColor group-hover:text-primaryThemeColor transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-secondaryTextColor">
                  {toFarsiNumber(cat.count)} کتاب
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
