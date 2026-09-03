"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import Footer from "@/components/footer/Footer";
import { UserContext } from "@/lib/UserProvider";
import { addressService } from "@/services/addressService";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/cartService";
import { toFarsiNumber } from "@/helper/helper";
import { Spinner, Button, Textarea, Radio, RadioGroup } from "@nextui-org/react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const router = useRouter();
  const { cart: contextCart, setCart } = useContext(UserContext);
  const [cart, setLocalCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load cart
      const cartResponse = await cartService.getCart();
      console.log("Cart Response:", cartResponse);
      if (cartResponse.success || cartResponse.items) {
        setLocalCart(cartResponse);
      }

      // Load addresses
      const addressResponse = await addressService.getAddresses();
      console.log("Address Response:", addressResponse);
      if (addressResponse.status === "success") {
        setAddresses(addressResponse.data || []);
        
        // Select default address
        const defaultAddress = addressResponse.data?.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
        }
      }
    } catch (error) {
      console.error("خطا در بارگذاری اطلاعات:", error);
      toast.error("خطا در بارگذاری اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      toast.error("لطفا آدرس ارسال را انتخاب کنید");
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting order with:", {
        addressId: selectedAddressId,
        paymentMethod: "online",
        notes: notes
      });

      const response = await orderService.createOrder(
        selectedAddressId,
        "online",
        notes
      );

      console.log("Order Response:", response);

      if (response.success || response.status === "success") {
        toast.success("سفارش با موفقیت ثبت شد");
        
        // Clear cart
        setCart(null);
        
        // Redirect to payment or order details
        const order = response.order || response.data;
        if (order?.payment_url) {
          window.location.href = order.payment_url;
        } else {
          router.push(`/user/orders`);
        }
      } else {
        toast.error(response.message || "خطا در ثبت سفارش");
      }
    } catch (error) {
      console.error("خطا در ثبت سفارش:", error);
      toast.error(error.response?.data?.message || "خطا در ثبت سفارش");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 items-center">
        <Header />
        <MobileHeader />
        <div className="w-full max-w-[1280px] flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4 items-center">
        <Header />
        <MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col items-center justify-center py-20 px-4 gap-6">
          <div className="w-32 h-32 rounded-full bg-secondaryThemeColor flex items-center justify-center">
            <i className="fi fi-sr-shopping-cart text-6xl text-secondaryTextColor h-16"></i>
          </div>
          <h2 className="text-2xl font-black text-primaryTextColor">
            سبد خرید شما خالی است!
          </h2>
          <Button
            as="a"
            href="/shop"
            className="bg-primaryThemeColor text-darkThemeColor font-bold"
          >
            بازگشت به فروشگاه
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cart.subtotal || cart.cost || cart.total_cost || 0;
  const tax = cart.tax || Math.round((subtotal * 9) / 100);
  const discount = cart.discount || cart.total_discount || 0;
  const total = cart.total || (subtotal + tax - discount);

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 mt-4 lg:mt-24 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
          <h1 className="text-2xl font-black text-primaryTextColor">
            تکمیل خرید
          </h1>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Order Summary */}
            <div className="w-full bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-6 border border-borderColor/20">
              <h2 className="text-lg font-bold text-primaryTextColor mb-4 flex items-center gap-2">
                <i className="fi fi-rr-list-check h-5"></i>
                خلاصه سفارش
              </h2>
              <div className="flex flex-col gap-3">
                {cart.items.map((item) => {
                  const product = item.info || item.product || item;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-3 border-b border-borderColor last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-primaryTextColor font-bold">
                          {product.title || product.name}
                        </span>
                        <span className="text-secondaryTextColor text-sm">
                          × {toFarsiNumber(item.qty || item.quantity || 1)}
                        </span>
                      </div>
                      <span className="text-primaryThemeColor font-bold">
                        {toFarsiNumber(item.cost || (product.price * (item.qty || 1)))} تومان
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address Selection */}
            <div className="w-full bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-6 border border-borderColor/20">
              <h2 className="text-lg font-bold text-primaryTextColor mb-4 flex items-center gap-2">
                <i className="fi fi-rr-marker h-5"></i>
                آدرس ارسال
              </h2>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-secondaryTextColor mb-4">
                    هنوز آدرسی ثبت نکرده‌اید
                  </p>
                  <Button
                    as="a"
                    href="/user/addresses"
                    className="bg-primaryThemeColor text-darkThemeColor font-bold"
                    startContent={<i className="fi fi-rr-plus h-4"></i>}
                  >
                    افزودن آدرس
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    classNames={{
                      wrapper: "gap-3",
                    }}
                  >
                    {addresses.map((address) => (
                      <Radio
                        key={address.id}
                        value={String(address.id)}
                        classNames={{
                          base: "w-full m-0 p-4 rounded-xl border-2 border-borderColor data-[selected=true]:border-primaryThemeColor data-[selected=true]:bg-primaryThemeColor/10 hover:border-primaryThemeColor/50 transition-all cursor-pointer",
                          wrapper: "hidden",
                          labelWrapper: "w-full m-0",
                        }}
                      >
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <strong className="text-primaryTextColor">
                              {address.recipient_name}
                            </strong>
                            {address.is_default && (
                              <span className="text-xs bg-primaryThemeColor text-darkThemeColor px-2 py-1 rounded-full font-bold">
                                پیش‌فرض
                              </span>
                            )}
                          </div>
                          <p className="text-secondaryTextColor text-sm mb-1">
                            <i className="fi fi-rr-phone-call h-3 ml-1"></i>
                            {address.phone_number}
                          </p>
                          <p className="text-secondaryTextColor text-sm mb-1">
                            <i className="fi fi-rr-map-marker h-3 ml-1"></i>
                            {address.province} - {address.city}
                          </p>
                          <p className="text-secondaryTextColor text-sm mb-1">
                            {address.address}
                          </p>
                          <p className="text-secondaryTextColor text-sm">
                            <i className="fi fi-rr-envelope h-3 ml-1"></i>
                            کدپستی: {address.postal_code}
                          </p>
                        </div>
                      </Radio>
                    ))}
                  </RadioGroup>
                  <Button
                    as="a"
                    href="/user/addresses"
                    variant="bordered"
                    className="w-full border-primaryThemeColor text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor font-bold"
                    startContent={<i className="fi fi-rr-settings h-4"></i>}
                  >
                    مدیریت آدرس‌ها
                  </Button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="w-full bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-6 border border-borderColor/20">
              <h2 className="text-lg font-bold text-primaryTextColor mb-4 flex items-center gap-2">
                <i className="fi fi-rr-comment-alt h-5"></i>
                توضیحات سفارش (اختیاری)
              </h2>
              <Textarea
                value={notes}
                onValueChange={setNotes}
                placeholder="توضیحات خود را وارد کنید..."
                minRows={4}
                variant="bordered"
                classNames={{
                  inputWrapper: "border border-borderColor focus-within:!border-borderColor !shadow-none !text-primaryTextColor",
                  input: "placeholder:!text-secondaryTextColor/60",
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[400px] h-fit bg-gradient-to-b from-secondaryThemeColor to-darkThemeColor rounded-2xl p-6 border border-borderColor/20 sticky top-24">
            <h2 className="text-lg font-bold text-primaryTextColor mb-4">
              جزئیات پرداخت
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-secondaryTextColor">جمع جزء:</span>
                <span className="text-primaryTextColor font-bold">
                  {toFarsiNumber(subtotal)} تومان
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondaryTextColor">مالیات (۹٪):</span>
                <span className="text-primaryTextColor font-bold">
                  {toFarsiNumber(tax)} تومان
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondaryTextColor">تخفیف:</span>
                  <span className="text-success font-bold">
                    -{toFarsiNumber(discount)} تومان
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center py-4 border-t border-borderColor mb-4">
              <span className="text-primaryTextColor font-bold">
                مبلغ قابل پرداخت:
              </span>
              <span className="text-2xl font-black text-primaryThemeColor">
                {toFarsiNumber(total)} تومان
              </span>
            </div>

            <Button
              onClick={handleSubmitOrder}
              isLoading={submitting}
              isDisabled={!selectedAddressId}
              className="w-full bg-success text-darkThemeColor font-bold h-12 rounded-2xl"
              startContent={!submitting && <i className="fi fi-rr-credit-card h-4"></i>}
            >
              پرداخت و ثبت سفارش
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
