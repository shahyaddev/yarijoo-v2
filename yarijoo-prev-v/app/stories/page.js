import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import StoriesHero from "@/components/stories/StoriesHero";
import StorySidebar from "@/components/stories/StorySidebar";
import StoryCard from "@/components/stories/StoryCard";
import StoriesPagination from "@/components/stories/StoriesPagination";
import { toFarsiNumber } from "@/helper/helper";
import { baseURL } from "@/services/API";
import React from "react";

export const metadata = {
  title: "یاریجو - داستان‌های الهام‌بخش",
  description:
    "داستان‌های واقعی و الهام‌بخش از افرادی که با چالش‌های روانی روبرو شدند",
};

const Page = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page)
    : 1;

  const fetchData = async () => {
    try {
      // Build query params for filter
      const params = new URLSearchParams();
      if (resolvedSearchParams?.search) params.append("search", resolvedSearchParams.search);
      if (resolvedSearchParams?.category_slug) params.append("category_slug", resolvedSearchParams.category_slug);
      if (resolvedSearchParams?.mood_slugs) params.append("mood_slugs", resolvedSearchParams.mood_slugs);
      if (resolvedSearchParams?.only_popular_topics) params.append("only_popular_topics", resolvedSearchParams.only_popular_topics);
      if (resolvedSearchParams?.only_active_moods) params.append("only_active_moods", resolvedSearchParams.only_active_moods);
      if (resolvedSearchParams?.sort) params.append("sort", resolvedSearchParams.sort);
      params.append("per_page", resolvedSearchParams?.per_page || "12");
      params.append("page", currentPage.toString());

      const url = `${baseURL}/story/stories/filter?${params.toString()}`;
      const storiesRes = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      if (!storiesRes.ok) {
        throw new Error(`HTTP error! status: ${storiesRes.status}`);
      }

      const data = await storiesRes.json();

      // Transform API data to match our component structure
      const stories = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.data) 
        ? data.data 
        : [];

      return {
        data: stories.map((story) => ({
          id: story.id,
          slug: story.slug,
          title: story.title,
          description:
            story.des?.replace(/<[^>]*>/g, "").substring(0, 200) + "..." || "",
          image: story.cover,
          category:
            story.categories && story.categories[0]
              ? story.categories[0].name
              : "داستان",
          author: story.author || "نام مستعار",
          date: story.published_at || new Date().toLocaleDateString("fa-IR"),
          readTime: Math.ceil((story.des?.length || 1000) / 1000),
          views: Math.floor(Math.random() * 3000) + 500,
          likes: Math.floor(Math.random() * 200) + 20,
        })),
        total: data.total || stories.length,
      };
    } catch (error) {
      console.error("Error fetching stories:", error);
      return { data: [], total: 0 };
    }
  };

  const { data: stories, total: totalStories } = await fetchData();
  const perPage = parseInt(resolvedSearchParams?.per_page || "12");
  const totalPages = Math.ceil(totalStories / perPage);

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Hero Section */}
        <StoriesHero totalStories={stories.length} />

        {/* Main Content */}
        <div className="w-full flex gap-6">
          {/* Sidebar */}
          <StorySidebar />

          {/* Stories Grid */}
          <div className="w-full flex flex-col gap-6">
            {/* Section Title */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
              <h2 className="text-2xl font-black text-primaryTextColor">
                داستان‌های الهام‌بخش
              </h2>
              <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
              <span className="text-sm text-secondaryTextColor">
                {toFarsiNumber(stories.length)} داستان
              </span>
            </div>

            {/* Stories Grid */}
            {stories && stories.length > 0 ? (
              <>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {stories.map((story, index) => (
                    <StoryCard key={index} data={story} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <StoriesPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalStories={totalStories}
                    perPage={perPage}
                  />
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
                  <i className="fi fi-rr-book-open-cover text-4xl text-secondaryTextColor h-10"></i>
                </div>
                <p className="text-xl font-bold text-primaryTextColor mb-2">
                  داستانی موجود نیست!
                </p>
                <p className="text-secondaryTextColor">
                  به زودی داستان‌های جدید اضافه می‌شوند
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Featured Categories */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
          {[
            { icon: "fi fi-rr-trophy", name: "موفقیت", count: 12 },
            { icon: "fi fi-rr-heart-arrow", name: "عشق و رابطه", count: 18 },
            { icon: "fi fi-rr-shield-check", name: "تاب‌آوری", count: 15 },
            { icon: "fi fi-rr-sparkles", name: "الهام‌بخش", count: 22 },
            { icon: "fi fi-rr-user-add", name: "خودشناسی", count: 14 },
            { icon: "fi fi-rr-comment-smile", name: "شادی", count: 9 },
          ].map((cat, index) => (
            <div
              key={cat.name}
              className="flex flex-col items-center gap-3 p-5 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 hover:border-primaryThemeColor/50 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all bg-primaryThemeColor/10 group-hover:bg-primaryThemeColor/20">
                <i className={`${cat.icon} text-2xl h-6 group-hover:scale-110 transition-transform text-primaryThemeColor`}></i>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-primaryTextColor group-hover:text-primaryThemeColor transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-secondaryTextColor">
                  {toFarsiNumber(cat.count)} داستان
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
