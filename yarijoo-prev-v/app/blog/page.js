import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { Suspense } from "react";
import Sidebar from "./Sidebar";
import SectionTitle from "@/components/shared/SectionTitle";
import NextTopLoader from "nextjs-toploader";
import SortDesktop from "./SortDesktop";
import { toFarsiNumber } from "@/helper/helper";
import { baseURL } from "@/services/API";
import BlogCard from "@/components/blog/BlogCard";
import BlogHero from "@/components/blog/BlogHero";
import FeaturedPosts from "@/components/blog/FeaturedPosts";
import Footer from "@/components/footer/Footer";
import SortAndFilterMobile from "./SortAndFilterMobile";
import Pagination from "@/components/shared/Pagination";

export const metadata = {
  title: "یاریجو - وبلاگ، دانستنی های دنیای روانشناسی",
  description: "",

  openGraph: {
    title: "یاریجو - وبلاگ، دانستنی های دنیای روانشناسی",
    description: "",
    url: `https://yarijoo.ir/blog`,
    metadataBase: new URL(`https://yarijoo.ir/blog`),
    siteName: "یاریجو",
    images: [
      {
        url: `/assets/yariend.png`,
        alt: "یاریجو - وبلاگ",
        width: 300,
        hieght: 300,
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
};

const Page = async ({ params, searchParams }) => {
  const pageNumber = searchParams.page || 1;
  const filter =
    searchParams.sort || searchParams.search || searchParams.category;

  const endPoint = filter ? "filter" : "index";

  const fetchPosts = async () => {
    try {
      if (filter) {
        // Use filter endpoint
        const filterBody = {
          ...(searchParams.search && { search: searchParams.search }),
          ...(searchParams.category && { category: searchParams.category }),
          ...(searchParams.tag_slugs && { tag_slugs: searchParams.tag_slugs }),
          ...(searchParams.only_popular_tags && { only_popular_tags: searchParams.only_popular_tags }),
          ...(searchParams.featured && { featured: searchParams.featured }),
          ...(searchParams.sort && { sort: searchParams.sort }),
          ...(searchParams.per_page && { per_page: searchParams.per_page }),
          page: pageNumber,
        };

        const postsRes = await fetch(
          `${baseURL}/blog/filter?page=${pageNumber}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filterBody),
            cache: "no-store",
          }
        );

        return { posts: await postsRes.json() };
      } else {
        // Use index endpoint
        const postsRes = await fetch(
          `${baseURL}/blog/index?page=${pageNumber}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        return { posts: await postsRes.json() };
      }
    } catch (error) {
      return { posts: { data: [], total: 0 } };
    }
  };

  const { posts } = await fetchPosts();

  const categoriesRes = await fetch(`${baseURL}/blog/category/get-categories`, {
    cache: "no-store",
  });

  const categories = await categoriesRes.json();

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Hero Section */}
        <BlogHero totalPosts={posts.total} />

        {/* Featured Posts */}
        <FeaturedPosts posts={posts.data} />

        <div className="w-full flex gap-4">
          {/* sidebar */}
          <Sidebar categories={categories.data} />

          <div className="w-full flex flex-col gap-4">
            {/* sort in mobile */}
            <SortAndFilterMobile categories={categories.data} />

            {/* sort in desktop */}
            <SortDesktop />

            {/* Section Title */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-1 h-6 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
              <h2 className="text-xl font-black text-primaryTextColor">
                همه مقالات
              </h2>
              <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
              <span className="text-sm text-secondaryTextColor">
                {toFarsiNumber(posts.total)} مقاله
              </span>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.data.length ? (
                posts.data.map((post, index) => <BlogCard data={post} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
                    <i className="fi fi-rr-document text-3xl text-secondaryTextColor h-8"></i>
                  </div>
                  <p className="text-secondaryTextColor">پستی وجود ندارد!</p>
                </div>
              )}
            </div>

            {/* paginate */}
            <Pagination links={posts} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
