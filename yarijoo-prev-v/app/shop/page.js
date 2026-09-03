import Header from "@/components/header/Header";
import React, { Suspense } from "react";
import Sidebar from "./Sidebar";
import { baseURL } from "@/services/API";
import SortDesktop from "./SortDesktop";
import NextTopLoader from "nextjs-toploader";
import ProductCard from "@/components/product/ProductCard";
import MobileHeader from "@/components/header/MobileHeader";
import SortAndFilterMobile from "./SortAndFilterMobile";
import Footer from "@/components/footer/Footer";
import ShopHero from "@/components/shop/ShopHero";
import ShopPagination from "@/components/shop/ShopPagination";
import SectionTitle from "@/components/shared/SectionTitle";
import { toFarsiNumber } from "@/helper/helper";
import ShopLoadingWrapper from "./ShopLoadingWrapper";

export const metadata = {
  title: "یاریجو - فروشگاه",
  description: "فروشگاه یاریجو",

  openGraph: {
    title: "یاریجو - فروشگاه",
    description: "فروشگاه یاریجو",
    url: `https://yarijoo.ir/shop`,
    metadataBase: new URL(`https://yarijoo.ir/shop`),
    siteName: "یاریجو",
    images: [
      {
        url: `/assets/yariend.png`,
        alt: "یاریجو - فروشگاه",
        width: 300,
        hieght: 300,
      },
    ],
    locale: "fa_IR",
    type: "article",
  },
};

const Shop = async ({ params, searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page
    ? parseInt(resolvedSearchParams.page)
    : 1;
  const perPage = parseInt(resolvedSearchParams?.per_page || "12");

  const filter =
    resolvedSearchParams.sort || resolvedSearchParams.search || resolvedSearchParams.category;

  const endPoint = filter ? "sort" : "view-all";

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const requestBody = filter ? {
    sort: resolvedSearchParams.sort,
    category: resolvedSearchParams.category,
    search: resolvedSearchParams.search,
    page: currentPage,
    per_page: perPage,
  } : null;

  const url = filter 
    ? `${baseURL}/shop/product/${endPoint}`
    : `${baseURL}/shop/product/${endPoint}?page=${currentPage}&per_page=${perPage}`;

  const productsRes = await fetch(url, {
    method: filter ? "POST" : "GET",
    headers,
    ...(requestBody && {
      body: JSON.stringify(requestBody),
    }),
    cache: "no-store",
  });

  const products = await productsRes.json();
  
  const totalPages = products?.total ? Math.ceil(products.total / perPage) : 1;

  const categoriesRes = await fetch(`${baseURL}/shop/category/get-categories`, {
    cache: "no-store",
  });

  const categories = await categoriesRes.json();

  return (
    <Suspense fallback={null}>
      <ShopLoadingWrapper>
        <div className="w-full flex flex-col gap-4 items-center">
          <Header />
          <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Hero Section */}
        <ShopHero totalProducts={products.total} />

        <div className="w-full flex gap-6">
          {/* sidebar */}
          <Sidebar categories={categories} />

          <div className="w-full flex flex-col gap-4">
            {/* sort in mobile */}
            <Suspense
              fallback={<NextTopLoader color="#dc2626" showSpinner={false} />}
            >
              <SortAndFilterMobile categories={categories} />
            </Suspense>

            {/* sort in desktop */}
            <Suspense
              fallback={<NextTopLoader color="#dc2626" showSpinner={false} />}
            >
              <SortDesktop />
            </Suspense>

            {/* Section Title */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-1 h-6 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
              <h2 className="text-xl font-black text-primaryTextColor">
                همه محصولات
              </h2>
              <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
              <span className="text-sm text-secondaryTextColor">
                {toFarsiNumber(products.total)} محصول
              </span>
            </div>

            {products.data && products.data.length > 0 ? (
              <>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.data.map((product, index) => (
                    <ProductCard key={product.id || index} data={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <ShopPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalProducts={products.total || products.data.length}
                    perPage={perPage}
                  />
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
                  <i className="fi fi-rr-shopping-bag text-3xl text-secondaryTextColor h-8"></i>
                </div>
                <p className="text-secondaryTextColor">محصولی وجود ندارد!</p>
              </div>
            )}
          </div>
        </div>
      </div>

        <Footer />
      </div>
      </ShopLoadingWrapper>
    </Suspense>
  );
};

export default Shop;
