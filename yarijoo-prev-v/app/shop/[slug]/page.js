import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import BreadCrumb from "@/components/shared/BreadCrumb";
import { baseURL, siteURL } from "@/services/API";
import React from "react";
import Sidebar from "./Sidebar";
import Image from "next/image";
import Footer from "@/components/footer/Footer";
import { cookies } from "next/headers";
import DescriptionComments from "./DescriptionComments";
import SaveToRecentlyViewed from "@/components/shop/SaveToRecentlyViewed";
import RecentlyViewed from "@/components/shop/RecentlyViewed";
import SimilarProducts from "@/components/shop/SimilarProducts";
import { toFarsiNumber } from "@/helper/helper";

export async function generateMetadata({ params }) {
  const productRes = await fetch(`${baseURL}/shop/product/show/${params.slug}`);

  const product = await productRes.json();

  return {
    title: `${product.title} - یاریجو`,
    description: product.description,

    openGraph: {
      title: `${product.title} - یاریجو`,
      description: product.description,
      url: `https://yarijoo.ir/shop/${params.slug}`,
      metadataBase: new URL(`https://yarijoo.ir/shop/${params.slug}`),
      siteName: "یاریجو",
      images: [
        {
          url: `${siteURL}/${product.image[0].image}`,
          alt: product.title,
          width: 500,
          hieght: 200,
        },
      ],
      locale: "fa_IR",
      type: "article",
    },
  };
}

const items = [
  { id: 1, title: "نوع محصول", desc: "پیامکی", icon: "fi fi-sr-box-open" },
  {
    id: 2,
    title: "پرداخت امن",
    desc: "درگاه زرینپال",
    icon: "fi fi-sr-shield-check",
  },
  {
    id: 3,
    title: "پشتیبانی ۲۴/۷",
    desc: "پشتیبانی سریع",
    icon: "fi fi-sr-user-headset",
  },
  {
    id: 4,
    title: "تضمین کیفیت",
    desc: "محصولات با کیفیت",
    icon: "fi fi-sr-features-alt",
  },
];

const Page = async ({ params }) => {
  const token = (await cookies()).get("token")?.value;

  const fetchData = async () => {
    try {
      const productRes = await fetch(
        `${baseURL}/shop/product/show/${params.slug}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { product: await productRes.json() };
    } catch (error) {
      return { product: {}, error };
    }
  };

  const { product } = await fetchData();

  const fetchComments = async () => {
    try {
      const commentsRes = await fetch(
        `${baseURL}/shop/comment/get-product-comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            page: 1,
          }),
          cache: "no-store",
        }
      );

      return { comments: await commentsRes.json() };
    } catch (error) {
      return { comments: [], error };
    }
  };

  const { comments } = await fetchComments();

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      {/* ذخیره محصول در لیست مشاهده شده */}
      <SaveToRecentlyViewed product={product} />

      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-4 px-4 xl:mt-24">
        {/* bread crumb */}
        <div className="w-full rounded-2xl h-14 bg-secondaryThemeColor flex items-center gap-3 px-4 overflow-x-auto scrollbar-none">
          <BreadCrumb link={"/"}>صفحه اصلی</BreadCrumb>
          <BreadCrumb link={"/shop"}>فروشگاه</BreadCrumb>
          <BreadCrumb link={""} active>
            {product.title}
          </BreadCrumb>
        </div>

        {/* product info & sidebar */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* cover */}
          <div className="w-full p-2 h-fit bg-secondaryThemeColor border border-borderColor rounded-2xl">
            <Image
              src={
                product?.image[0].image
                  ? `${siteURL}/${product?.image[0].image}`
                  : "/assets/product.jpg"
              }
              width={900}
              height={450}
              alt={product?.title}
              className="rounded-xl w-full h-full object-cover"
            />
          </div>

          {/* name & other info & add cart */}
          <div className="flex flex-col lg:col-span-2 gap-4">
            <div className="flex flex-col gap-2 pb-4 border-b border-borderColor">
              <h1 className="text-lg font-black text-primaryTextColor">
                {product?.title}
              </h1>

              <div className="text-xs text-primaryThemeColor w-fit">
                نام دسته بندی
              </div>
            </div>

            <div className="w-full flex flex-col lg:flex-row lg:gap-8 gap-4">
              {/* info */}
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center text-secondaryTextColor gap-2">
                  <div className="flex items-center justify-center size-8 rounded-xl border border-borderColor bg-darkThemeColor/50">
                    <i className="fi fi-rr-clock text-primaryThemeColor text-base h-4"></i>
                  </div>

                  {product?.updated_at && (
                    <span className="text-sm text-primaryTextColor">
                      بروزرسانی: {new Intl.DateTimeFormat("fa-IR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(product?.updated_at))}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-secondaryTextColor gap-2">
                  <div className="flex items-center justify-center size-8 rounded-xl border border-borderColor bg-darkThemeColor/50">
                    <i className="fi fi-rr-star text-yellow-500 text-base h-4"></i>
                  </div>

                  <span className="text-sm text-primaryTextColor">
                    {product?.rate
                      ? `امتیاز: ${toFarsiNumber(product?.rate)} از ${toFarsiNumber(5)}`
                      : "بدون امتیاز"}
                  </span>
                </div>

                {product?.features && (
                  <p className="text-sm text-primaryTextColor leading-6 line-clamp-3">
                    {product?.features}
                  </p>
                )}
              </div>

              {/* add cart */}
              <Sidebar data={product} />
            </div>

            {/* items */}
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="w-full flex flex-col gap-3 items-center justify-center bg-secondaryThemeColor rounded-2xl border border-borderColor/60 p-5 hover:border-primaryThemeColor/40 transition-all"
                >
                  <div className="size-14 bg-primaryThemeColor/10 rounded-full flex justify-center items-center border-2 border-primaryThemeColor/20">
                    <i className={`${item.icon} text-2xl h-6 text-primaryThemeColor`}></i>
                  </div>

                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-xs font-semibold text-secondaryTextColor">
                      {item.title}
                    </span>
                    <span className="text-sm text-center font-bold text-primaryTextColor">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* desc & comments */}
        <DescriptionComments product={product} comments={comments} />

        {/* Similar Products */}
        <SimilarProducts
          categoryId={product.category?.id}
          currentProductId={product.id}
        />

        {/* Recently Viewed Products */}
        <RecentlyViewed currentProductId={product.id} />
      </div>

      <Footer />
    </div>
  );
};

export default Page;
