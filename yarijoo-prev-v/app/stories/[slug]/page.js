import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import BreadCrumb from "@/components/shared/BreadCrumb";
import StoryBookmarkButton from "@/components/stories/StoryBookmarkButton";
import React from "react";
import { baseURL, siteURL } from "@/services/API";
import { calculateReadingTime, toFarsiNumber } from "@/helper/helper";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const storiesRes = await fetch(`${baseURL}/story/stories`, {
      method: "GET",
      cache: "no-store",
    });

    if (!storiesRes.ok) {
      return {
        title: "داستان یافت نشد - یاریجو",
      };
    }

    const allStories = await storiesRes.json();
    const story = Array.isArray(allStories)
      ? allStories.find((s) => s.slug === slug || s.slug === decodedSlug)
      : null;

    if (!story) {
      return {
        title: "داستان یافت نشد - یاریجو",
      };
    }

    return {
      title: `${story.title || "داستان"} - یاریجو`,
      description: story.des?.replace(/<[^>]*>/g, "").substring(0, 160) || "داستان الهام‌بخش از یاریجو",
    };
  } catch (error) {
    return {
      title: "داستان - یاریجو",
    };
  }
}

const Page = async ({ params }) => {
  const { slug } = await params;

  // Decode the slug from URL encoding
  const decodedSlug = decodeURIComponent(slug);

  // Fetch story by slug
  const storiesRes = await fetch(`${baseURL}/story/stories`, {
    method: "GET",
    cache: "no-store",
  });

  if (!storiesRes.ok) return notFound();

  const allStories = await storiesRes.json();
  
  // Try to find with both encoded and decoded slug
  const story = Array.isArray(allStories) 
    ? allStories.find(s => s.slug === slug || s.slug === decodedSlug)
    : null;

  if (!story) {
    console.log('Story not found. Requested slug:', slug);
    console.log('Decoded slug:', decodedSlug);
    console.log('Available slugs:', allStories.map(s => s.slug).slice(0, 5));
    return notFound();
  }

  const readingTime = calculateReadingTime(story.des?.length || 0);

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Breadcrumb */}
        <div className="w-full rounded-2xl h-14 bg-secondaryThemeColor flex items-center gap-3 px-4 overflow-x-auto scrollbar-none border border-borderColor/60">
          <BreadCrumb link={"/"}>صفحه اصلی</BreadCrumb>
          <BreadCrumb link={"/stories"}>داستان‌ها</BreadCrumb>
          <BreadCrumb link={""} active>
            {story.title}
          </BreadCrumb>
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {/* Story Cover */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-borderColor/60 bg-gradient-to-br from-[#222529] to-[#1c1e21] shadow-2xl">
              {story.cover && (
                <Image
                  src={`${siteURL}/${story.cover}`}
                  fill
                  className="object-cover"
                  alt={story.title}
                  priority
                />
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-darkThemeColor/60 via-transparent to-transparent"></div>
            </div>

            {/* Quick Actions */}
            <div className="w-full bg-secondaryThemeColor rounded-2xl p-5 border border-borderColor/60">
              <div className="flex items-center gap-2 mb-4">
                <i className="fi fi-rr-apps text-primaryThemeColor h-4"></i>
                <h3 className="text-base font-bold text-primaryTextColor">عملیات سریع</h3>
              </div>

              <div className="space-y-2">
                <StoryBookmarkButton story={story} />

                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-darkThemeColor/30 hover:bg-darkThemeColor/50 text-secondaryTextColor hover:text-primaryTextColor transition-all group">
                  <i className="fi fi-rr-share text-primaryThemeColor h-4 group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-semibold">اشتراک‌گذاری داستان</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-darkThemeColor/30 hover:bg-darkThemeColor/50 text-secondaryTextColor hover:text-primaryTextColor transition-all group">
                  <i className="fi fi-rr-comment text-primaryThemeColor h-4 group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-semibold">نظرات و دیدگاه‌ها</span>
                </button>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="w-full flex flex-col gap-6">
            {/* Story Header */}
            <div className="w-full bg-gradient-to-br from-secondaryThemeColor via-secondaryThemeColor/80 to-primaryThemeColor/5 rounded-2xl overflow-hidden p-6 border border-borderColor/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
                <h1 className="text-2xl text-primaryTextColor font-black">
                  {story.title}
                </h1>
              </div>

              {/* Story Meta */}
              <div className="w-full flex flex-wrap items-center gap-4 text-sm">
                {/* Author */}
                {story.author && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-user-pen text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">{story.author}</span>
                  </div>
                )}

                {/* Published Date */}
                {story.published_at && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-calendar text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(story.published_at)}
                    </span>
                  </div>
                )}

                {/* Reading Time */}
                <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                  <i className="fi fi-rr-clock text-primaryThemeColor h-4"></i>
                  <span className="text-primaryTextColor">
                    {toFarsiNumber(readingTime)} دقیقه
                  </span>
                </div>

                {/* Views */}
                <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                  <i className="fi fi-rr-eye text-primaryThemeColor h-4"></i>
                  <span className="text-primaryTextColor">
                    {toFarsiNumber(Math.floor(Math.random() * 3000) + 500)} بازدید
                  </span>
                </div>
              </div>
            </div>
            {/* Story Body */}
            <div className="w-full bg-secondaryThemeColor rounded-2xl overflow-hidden p-8 border border-borderColor/60">
              <div
                dangerouslySetInnerHTML={{ __html: story.des || "محتوایی برای این داستان موجود نیست." }}
                className="prose prose-lg prose-invert max-w-none text-primaryTextColor leading-8 text-justify"
              ></div>
            </div>

            {/* Related Tags */}
            {story.categories && story.categories.length > 0 && (
              <div className="w-full bg-secondaryThemeColor rounded-2xl p-6 border border-borderColor/60">
                <div className="flex items-center gap-3 mb-4">
                  <i className="fi fi-rr-tags text-primaryThemeColor h-4"></i>
                  <h3 className="text-lg font-bold text-primaryTextColor">موضوعات مرتبط</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/stories?category=${cat.slug}`}
                      className="px-4 py-2 rounded-xl bg-primaryThemeColor/10 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-white transition-all border border-primaryThemeColor/20 text-sm font-semibold"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;