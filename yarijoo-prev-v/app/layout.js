import "./globals.css";
import "../css/styles.css";
import '@flaticon/flaticon-uicons/css/all/all.css';
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import { getCart, getUser } from "@/lib/storage";
import UserProvider from "@/lib/UserProvider";
import { cookies } from "next/headers";
export const metadata = {
  title: "یاریجو",
  description: "یاریجو",
};

export default async function RootLayout({ children }) {
  const user = await getUser();
  const cart = await getCart();

  const token = (await cookies()).get("token")?.value;

  return (
    <html lang="fa" dir="rtl" className="bg-[#0F0F0F] text-primaryTextColor">
      <body className="bg-[#0F0F0F] text-primaryTextColor antialiased min-h-screen">
        <NextTopLoader color="#1fd2a9" showSpinner={false} />
{/* 1fd2a9 */}
        <Providers>
          <UserProvider userData={user} userCart={cart} token={token}>
            {children}
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
