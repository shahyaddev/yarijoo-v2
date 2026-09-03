import { baseURL } from "@/services/API";
import React from "react";
import BookPages from "./BookPages";
import { notFound } from "next/navigation";

const Page = async ({ params, searchParams }) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialPage = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) - 1 : 0;

  const bookRes = await fetch(`${baseURL}/book/get-page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book_id: id }),
    cache: "no-store",
  });

  if (bookRes.status === 404) return notFound();

  const book = await bookRes.json();

  return (
    <div className="w-full flex justify-center">
      <BookPages data={book} initialPageIndex={initialPage} />
    </div>
  );
};

export default Page;
