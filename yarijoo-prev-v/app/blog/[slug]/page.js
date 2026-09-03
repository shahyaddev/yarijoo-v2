import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import BreadCrumb from "@/components/shared/BreadCrumb";
import { baseURL, siteURL } from "@/services/API";
import React from "react";
import Sidebar from "./Sidebar";
import Footer from "@/components/footer/Footer";
import { toFarsiNumber } from "@/helper/helper";
import Image from "next/image";
import Rate from "@/components/shared/comment/Rate";
import SendComment from "@/components/shared/comment/SendComment";
import Comment from "@/components/shared/comment/Comment";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { cookies } from "next/headers";
import BlogContentWrapper from "./BlogContentWrapper";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  try {
    const postRes = await fetch(`${baseURL}/blog/post/show/${params.slug}`);
    
    if (!postRes.ok) {
      return {
        title: "مقاله - یاریجو",
        description: "مقاله یافت نشد",
      };
    }

    const post = await postRes.json();

    if (!post || !post.details) {
      return {
        title: "مقاله - یاریجو",
        description: "مقاله یافت نشد",
      };
    }

    return {
      title: `${post.details.title || "مقاله"} - یاریجو`,
      description: post.details.description || "مقاله تخصصی روانشناسی",
      keywords: post?.details?.keywords || [],
      openGraph: {
        title: `${post.details.title || "مقاله"} - یاریجو`,
        description: post.details.description || "مقاله تخصصی روانشناسی",
        url: `https://yarijoo.ir/blog/${params.slug}`,
        metadataBase: new URL(`https://yarijoo.ir/blog/${params.slug}`),
        siteName: "یاریجو",
        images: [
          {
            url: post.details.image ? `${siteURL}/${post.details.image}` : `/assets/yariend.png`,
            alt: post.details.title || "مقاله",
            width: 1200,
            hieght: 800,
          },
        ],
        locale: "fa_IR",
        type: "article",
      },
    };
  } catch (error) {
    return {
      title: "مقاله - یاریجو",
      description: "مقاله یافت نشد",
    };
  }
}

const Page = async ({ params }) => {
  const token = (await cookies()).get("token")?.value;

  // محاسبه زمان مطالعه
  const calculateReadingTime = (content) => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const fetchData = async () => {
    try {
      const postRes = await fetch(`${baseURL}/blog/post/show/${params.slug}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { post: await postRes.json() };
    } catch (error) {
      return { post: error };
    }
  };
  const { post } = await fetchData();

  // Check if post exists and has details
  if (!post || !post.details) {
    console.log(post);
    // return notFound();
  }

  const fetchComments = async () => {
    try {
      const commentsRes = await fetch(
        `${baseURL}/blog/post/comment/get-post-comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post.details?.id,
            page: 1,
          }),
          cache: "no-store",
        }
      );

      return { comments: await commentsRes.json() };
    } catch (error) {
      return { comments: { comments: [] } };
    }
  };

  const { comments } = await fetchComments();

  // دریافت مقالات مرتبط
  const fetchRelatedPosts = async () => {
    try {
      const relatedRes = await fetch(`${baseURL}/blog/post/random-posts`, {
        cache: "no-store",
      });
      return { relatedPosts: await relatedRes.json() };
    } catch (error) {
      return { relatedPosts: [] };
    }
  };

  const { relatedPosts } = await fetchRelatedPosts();

  const readingTime = calculateReadingTime(post.details?.content || "");

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-4 px-4 lg:mt-24">
        {/* bread crumb */}
        <div className="w-full rounded-2xl h-14 bg-secondaryThemeColor flex items-center gap-3 px-4 overflow-x-auto scrollbar-none border border-borderColor/60">
          <BreadCrumb link={"/"}>صفحه اصلی</BreadCrumb>
          <BreadCrumb link={"/blog"}>وبلاگ</BreadCrumb>
          <BreadCrumb link={""} active>
            {post.details?.title || "مقاله"}
          </BreadCrumb>
        </div>

        <BlogContentWrapper content={post.details?.content || ""}>
          <div className="w-full flex flex-col lg:flex-row gap-6">
            {/* post */}
            <div className="w-full lg:flex-1 flex flex-col gap-6">
            <div className="w-full flex flex-col gap-4 bg-secondaryThemeColor rounded-2xl overflow-hidden p-5 border border-borderColor/60">
              {/* title */}
              <div className="relative flex items-center gap-3 text-xl font-black pb-4 border-b border-borderColor">
                <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>

                <h1 className="text-primaryTextColor">{post.details?.title || "مقاله"}</h1>
              </div>

              {/* post info */}
              <div className="w-full flex flex-wrap gap-4 items-center text-sm">
                {/* author */}
                {post.details?.author && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-user-pen text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {post.details.author.name +
                        " " +
                        post.details.author.family_name}
                    </span>
                  </div>
                )}

                {/* date */}
                {post.details?.created_at && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-calendar text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {new Intl.DateTimeFormat("fa-IR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(post.details.created_at))}
                    </span>
                  </div>
                )}

                {/* comments */}
                <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                  <i className="fi fi-rr-comment text-primaryThemeColor h-4"></i>
                  <span className="text-primaryTextColor">
                    {comments?.comments?.length 
                      ? `${toFarsiNumber(comments?.comments?.length)} دیدگاه`
                      : 'بدون دیدگاه'}
                  </span>
                </div>

                {/* view */}
                {post.details?.view_count && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-overview text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(post.details.view_count)} بازدید
                    </span>
                  </div>
                )}

                {/* rate */}
                {post.details?.rate && post.details.rate > 0 && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-star text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(post.details.rate.toFixed(1))} از ۵
                    </span>
                  </div>
                )}

                {/* reading time */}
                {readingTime > 0 && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-clock text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(readingTime)} دقیقه
                    </span>
                  </div>
                )}
              </div>

              {post.details?.image && (
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mt-2">
                  <Image
                    src={`${siteURL}/${post.details.image}`}
                    fill
                    className="object-cover"
                    alt={post.details?.title || "مقاله"}
                    priority
                  />
                </div>
              )}

              {post.details?.content && (
                <div
                  className="blog-post text-primaryTextColor leading-[35px]"
                  dangerouslySetInnerHTML={{ __html: post.details.content }}
                ></div>
              )}

              {post?.tags && post.tags.length > 0 && (
                <div className="w-full flex flex-col gap-3 mt-3">
                  <span className="text-primaryTextColor font-black">برچسب ها :</span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        title={tag.name}
                        className="text-sm py-2 px-4 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all cursor-pointer"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* comment section */}
            <div className="w-full h-auto flex flex-col gap-10 p-4 relative bg-secondaryThemeColor overflow-hidden rounded-2xl">
              {/* rate */}
              <Rate
                id={post?.details?.id}
                type="blog"
                rated={post?.details?.rated}
              />

              {/* comment title */}
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl w-fit h-fit font-black text-primaryTextColor border-b-4 border-primaryThemeColor">
                    دیدگاه شما
                  </h3>
                </div>

                <SendComment id={post?.details?.id} type="blog" />
              </div>

              <div className="flex flex-col gap-6">
                {/* comment title */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl w-fit h-fit font-black text-primaryTextColor border-b-4 border-primaryThemeColor">
                      دیدگاه کاربران
                    </h3>
                  </div>

                  <span className="text-lg text-secondaryTextColor">
                    {toFarsiNumber(comments?.comments?.length)} دیدگاه
                  </span>
                </div>

                {/* comments */}
                <div className="flex flex-col text-secondaryTextColor gap-4">
                  {comments?.comments?.length
                    ? comments?.comments?.map((comment) => (
                        <Comment
                          id={post?.details?.id}
                          data={comment}
                          type="blog"
                        />
                      ))
                    : "دیدگاهی برای این مقاله وجود ندارد !"}
                </div>
              </div>
            </div>
          </div>

          {/* sidebar */}
          {post.details && (
            <Sidebar 
              postId={post.details.id} 
              postTitle={post.details.title}
              postUrl={`https://yarijoo.ir/blog/${params.slug}`}
              postData={post.details}
            />
          )}
          </div>
        </BlogContentWrapper>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <RelatedPosts posts={relatedPosts} title="مقالات پیشنهادی" />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Page;
