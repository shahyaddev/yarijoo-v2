"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toFarsiNumber } from "@/helper/helper";

const MessagesList = ({ messages, isAuthenticated = false, hasPurchased = false }) => {
  const [expandedMessage, setExpandedMessage] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="w-full bg-secondaryThemeColor rounded-2xl p-8 text-center border border-borderColor/60">
        <i className="fi fi-rr-lock text-4xl text-secondaryTextColor h-10 mb-3"></i>
        <p className="text-secondaryTextColor mb-4">برای مشاهده پیام‌های SMS شده، ابتدا وارد حساب کاربری خود شوید</p>
        <p className="text-sm text-secondaryTextColor/70">پس از خرید پکیج و ارسال پیام‌ها، اینجا نمایش داده می‌شوند</p>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="w-full bg-secondaryThemeColor rounded-2xl p-8 text-center border border-borderColor/60">
        <i className="fi fi-rr-shopping-cart text-4xl text-secondaryTextColor h-10 mb-3"></i>
        <p className="text-secondaryTextColor mb-4">شما این پکیج را خریداری نکرده‌اید</p>
        <p className="text-sm text-secondaryTextColor/70">پس از خرید و ارسال پیام‌ها، اینجا نمایش داده می‌شوند</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="w-full bg-secondaryThemeColor rounded-2xl p-8 text-center border border-borderColor/60">
        <i className="fi fi-rr-comment-info text-4xl text-secondaryTextColor h-10 mb-3"></i>
        <p className="text-secondaryTextColor">هنوز پیامی برای شما ارسال نشده است</p>
        <p className="text-sm text-secondaryTextColor/70 mt-2">پیام‌ها به صورت روزانه برای شما ارسال می‌شوند</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-secondaryThemeColor rounded-2xl border border-borderColor/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 p-6 border-b border-borderColor/40">
        <div className="flex items-center gap-3">
          <i className="fi fi-rr-list text-2xl text-primaryThemeColor h-6"></i>
          <h2 className="text-xl font-black text-primaryTextColor">
            لیست پیام‌ها
          </h2>
          <div className="flex-1 h-px bg-borderColor"></div>
          <span className="text-sm font-bold text-primaryThemeColor bg-primaryThemeColor/10 px-3 py-1 rounded-full">
            {toFarsiNumber(messages.length)} پیام
          </span>
        </div>
      </div>

      {/* Messages List */}
      <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="border border-borderColor/40 rounded-xl bg-darkThemeColor/30 overflow-hidden hover:border-primaryThemeColor/40 transition-all"
          >
            {/* Message Header */}
            <button
              onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)}
              className="w-full flex items-center justify-between p-4 text-right"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-primaryThemeColor/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primaryThemeColor">
                    {toFarsiNumber(message.order || index + 1)}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-primaryTextColor">
                      پیام روز {toFarsiNumber(message.day || index + 1)}
                    </span>
                    {message.time && (
                      <span className="text-xs text-secondaryTextColor bg-darkThemeColor/50 px-2 py-0.5 rounded">
                        ساعت {toFarsiNumber(message.time)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-secondaryTextColor truncate">
                    {message.message?.substring(0, 50)}...
                  </div>
                </div>
              </div>

              <i className={`fi ${expandedMessage === message.id ? 'fi-rr-angle-up' : 'fi-rr-angle-down'} text-primaryThemeColor text-lg h-4 transition-transform`}></i>
            </button>

            {/* Message Content (Expanded) */}
            {expandedMessage === message.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-borderColor/40"
              >
                <div className="p-4 bg-darkThemeColor/20">
                  <div className="text-sm text-primaryTextColor leading-7 whitespace-pre-line">
                    {message.message}
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
                    <i className="fi fi-rr-check-circle h-3"></i>
                    <span>این پیام از طریق SMS برای شما ارسال شده است</span>
                    {message.sent_at && (
                      <span className="text-secondaryTextColor">
                        ({new Date(message.sent_at).toLocaleDateString('fa-IR')})
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MessagesList;


