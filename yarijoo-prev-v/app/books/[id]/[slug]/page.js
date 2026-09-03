import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import BreadCrumb from "@/components/shared/BreadCrumb";
import BookRating from "@/components/book/BookRating";
import React from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { baseURL } from "@/services/API";
import { calculateReadingTime, toFarsiNumber } from "@/helper/helper";
import { notFound } from "next/navigation";
import SendComment from "@/components/shared/comment/SendComment";
import Comment from "@/components/shared/comment/Comment";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const bookRes = await fetch(`${baseURL}/book/get-book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
    cache: "no-store",
  });

  if (bookRes.status === 404) {
    return {
      title: "کتاب یافت نشد - یاریجو",
    };
  }

  const book = await bookRes.json();
  return {
    title: `${book?.book?.title || "کتاب"} - یاریجو`,
    description: book?.book?.des || "کتاب تخصصی روانشناسی و خودشناسی",
  };
}

const Page = async ({ params }) => {
  const { id, slug } = await params;

  const bookRes = await fetch(`${baseURL}/book/get-book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
    cache: "no-store",
  });

  if (bookRes.status === 404) return notFound();

  const book = await bookRes.json();

  // Fetch comments
  const fetchComments = async () => {
    try {
      const commentsRes = await fetch(
        `${baseURL}/book/books/${slug}/comments?per_page=10`,
        {
          cache: "no-store",
        }
      );
      if (commentsRes.ok) {
        return await commentsRes.json();
      }
      return { comments: [] };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return { comments: [] };
    }
  };

  const comments = await fetchComments();

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Breadcrumb */}
        <div className="w-full rounded-2xl h-14 bg-secondaryThemeColor flex items-center gap-3 px-4 overflow-x-auto scrollbar-none border border-borderColor/60">
          <BreadCrumb link={"/"}>صفحه اصلی</BreadCrumb>
          <BreadCrumb link={"/books"}>کتاب ها</BreadCrumb>
          <BreadCrumb link={""} active>
            {book?.book?.title}
          </BreadCrumb>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <Sidebar data={book} />

          {/* Main Content */}
          <div className="w-full flex flex-col gap-6">
            {/* Book Header */}
            <div className="w-full bg-gradient-to-br from-secondaryThemeColor via-secondaryThemeColor/80 to-primaryThemeColor/5 rounded-2xl overflow-hidden p-6 border border-borderColor/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
                <h1 className="text-2xl text-primaryTextColor font-black">
                  {book?.book?.title}
                </h1>
              </div>

              {/* Book Meta */}
              <div className="w-full flex flex-wrap items-center gap-4 text-sm">
                {/* Author */}
                {book?.book?.author && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-user-pen text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">{book.book.author}</span>
                  </div>
                )}

                {/* Published Date */}
                {book?.book?.published_at && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-calendar text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(book.book.published_at)}
                    </span>
                  </div>
                )}

                {/* Reading Time */}
                {book?.total_content_length && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-clock text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(calculateReadingTime(book.total_content_length))} دقیقه
                    </span>
                  </div>
                )}

                {/* Pages Count */}
                {book?.pages_count && (
                  <div className="flex items-center gap-2 bg-darkThemeColor/50 px-4 py-2 rounded-xl border border-borderColor/40">
                    <i className="fi fi-rr-book text-primaryThemeColor h-4"></i>
                    <span className="text-primaryTextColor">
                      {toFarsiNumber(book.pages_count)} صفحه
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Description */}
            <div className="w-full bg-secondaryThemeColor rounded-2xl overflow-hidden p-6 border border-borderColor/60">
              <div className="flex items-center gap-3 mb-4">
                <i className="fi fi-rr-document text-primaryThemeColor text-xl h-5"></i>
                <h2 className="text-xl text-primaryTextColor font-black">درباره کتاب</h2>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: book?.book?.des || "توضیحاتی برای این کتاب موجود نیست." }}
                className="text-base text-primaryTextColor leading-7 text-justify prose prose-invert max-w-none"
              ></div>
            </div>

            {/* Book Features */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 group hover:border-primaryThemeColor/50 transition-all">
                <div className="w-14 h-14 rounded-xl bg-primaryThemeColor/10 flex items-center justify-center group-hover:bg-primaryThemeColor/20 transition-all">
                  <i className="fi fi-rr-mobile-button text-2xl text-primaryThemeColor h-6"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primaryTextColor mb-1">قابل مطالعه در همه جا</h3>
                  <p className="text-xs text-secondaryTextColor">در موبایل، تبلت و کامپیوتر</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 group hover:border-primaryThemeColor/50 transition-all">
                <div className="w-14 h-14 rounded-xl bg-primaryThemeColor/10 flex items-center justify-center group-hover:bg-primaryThemeColor/20 transition-all">
                  <i className="fi fi-rr-shield-check text-2xl text-primaryThemeColor h-6"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primaryTextColor mb-1">محتوای تضمین شده</h3>
                  <p className="text-xs text-secondaryTextColor">کیفیت بالا و کاملاً تخصصی</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 group hover:border-primaryThemeColor/50 transition-all">
                <div className="w-14 h-14 rounded-xl bg-primaryThemeColor/10 flex items-center justify-center group-hover:bg-primaryThemeColor/20 transition-all">
                  <i className="fi fi-rr-bookmark text-2xl text-primaryThemeColor h-6"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primaryTextColor mb-1">ذخیره پیشرفت</h3>
                  <p className="text-xs text-secondaryTextColor">از جایی که خواندید ادامه دهید</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 group hover:border-primaryThemeColor/50 transition-all">
                <div className="w-14 h-14 rounded-xl bg-primaryThemeColor/10 flex items-center justify-center group-hover:bg-primaryThemeColor/20 transition-all">
                  <i className="fi fi-rr-headset text-2xl text-primaryThemeColor h-6"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primaryTextColor mb-1">پشتیبانی ۲۴/۷</h3>
                  <p className="text-xs text-secondaryTextColor">همیشه در کنار شما هستیم</p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            {book?.book?.pages && book.book.pages.length > 0 && (
              <div className="w-full bg-secondaryThemeColor rounded-2xl overflow-hidden p-6 border border-borderColor/60">
                <div className="flex items-center gap-3 mb-4">
                  <i className="fi fi-rr-list text-primaryThemeColor text-xl h-5"></i>
                  <h2 className="text-xl text-primaryTextColor font-black">فهرست مطالب</h2>
                  <span className="text-sm text-secondaryTextColor">
                    ({toFarsiNumber(book.book.pages.length)} فصل)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {book.book.pages.map((page, index) => (
                    <Link
                      key={page.id}
                      href={`/books/reader/${book.book.id}/${book.book.slug}?page=${index + 1}`}
                      className="flex items-center gap-3 p-3 bg-darkThemeColor/50 rounded-xl border border-borderColor/40 hover:border-primaryThemeColor/50 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primaryThemeColor/10 flex items-center justify-center text-primaryThemeColor font-bold text-sm group-hover:bg-primaryThemeColor/20 transition-all shrink-0">
                        {toFarsiNumber(index + 1)}
                      </div>
                      <span className="text-sm text-secondaryTextColor group-hover:text-primaryTextColor transition-all flex-1">
                        {page.title}
                      </span>
                      <i className="fi fi-rr-angle-left text-secondaryTextColor group-hover:text-primaryThemeColor opacity-0 group-hover:opacity-100 transition-all h-4"></i>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Book Rating */}
            <BookRating bookId={id} />

            {/* Comments Section */}
            <div className="w-full bg-secondaryThemeColor rounded-2xl overflow-hidden p-6 border border-borderColor/60">
              <div className="flex items-center gap-3 mb-6">
                <i className="fi fi-rr-comment text-primaryThemeColor text-xl h-5"></i>
                <h2 className="text-xl text-primaryTextColor font-black">نظرات کاربران</h2>
                {comments?.comments && comments.comments.length > 0 && (
                  <span className="text-sm text-secondaryTextColor">
                    ({toFarsiNumber(comments.comments.length)} نظر)
                  </span>
                )}
              </div>

              {/* Send Comment */}
              <div className="mb-6">
                <SendComment id={slug} type="book" />
              </div>

              {/* Comments List */}
              <div className="flex flex-col gap-4">
                {comments?.comments && comments.comments.length > 0 ? (
                  comments.comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      id={slug}
                      data={comment}
                      type="book"
                      className="bg-darkThemeColor border border-borderColor/40"
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-secondaryTextColor">
                    هنوز نظری ثبت نشده است
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
