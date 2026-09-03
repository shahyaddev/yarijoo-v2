"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input, Button, Spinner } from "@nextui-org/react";
import toast from "react-hot-toast";
import { baseURL } from "@/services/API";

// Helper function to generate unique IDs
const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const ConsultationChat = () => {
  const [showChat, setShowChat] = useState(false);
  const [showFullChat, setShowFullChat] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "سلام! من دستیار هوشمند یاریجو هستم. 👋\n\nمی‌توانم به شما کمک کنم تا:\n• درباره نگرانی‌ها و احساساتتان صحبت کنیم\n• بهترین مشاور را برای شما پیشنهاد دهم\n• نوبت مشاوره را برایتان رزرو کنم\n\nلطفاً بگویید چه کمکی می‌توانم به شما بکنم؟",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (showFullChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showFullChat]);

  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    const userMessage = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsSending(true);

    try {
      const chatHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${baseURL}/consultation/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          chatHistory: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در برقراری ارتباط با سرور");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: "assistant",
          content:
            data.reply ||
            "پاسخی از سمت مشاور دریافت نشد. لطفاً بعداً تلاش کنید.",
        },
      ]);

      if (data.shouldBookAppointment && data.extractedInfo) {
        setIsBooking(true);
        await handleBookAppointment(data.extractedInfo, chatHistory);
      }
    } catch (error) {
      console.error("chat error", error);
      toast.error("ارسال پیام با مشکل مواجه شد");
      setMessages((prev) => [
        ...prev,
        {
          id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: "assistant",
          content:
            "در حال حاضر به مشکل فنی برخورده‌ایم. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleBookAppointment = async (extractedInfo, chatHistory) => {
    try {
      const response = await fetch(`${baseURL}/consultation/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...extractedInfo,
          chatHistory: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در ثبت نوبت");
      }

      const data = await response.json();

      toast.success(
        "نوبت شما با موفقیت ثبت شد! همکاران ما برای هماهنگی با شما تماس می‌گیرند."
      );

      setMessages((prev) => [
        ...prev,
        {
          id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: "assistant",
          content: `✅ نوبت شما با موفقیت ثبت شد!\n\n📋 اطلاعات ثبت شده:\n• نام: ${extractedInfo.fullName || "ثبت نشد"
            }\n• شماره تماس: ${extractedInfo.phone || "ثبت نشد"
            }\n• تاریخ پیشنهادی: ${extractedInfo.preferredDate || "ثبت نشد"
            }\n• ساعت پیشنهادی: ${extractedInfo.preferredTime || "ثبت نشد"
            }\n\nهمکاران ما ظرف ۲۴ ساعت آینده با شما تماس خواهند گرفت.`,
        },
      ]);

      setIsBooking(false);
    } catch (error) {
      console.error("booking error", error);
      toast.error("ثبت نوبت با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
      setIsBooking(false);
    }
  };

  const renderMessage = (message) => {
    const isUser = message.role === "user";

    return (
      <div
        key={message.id}
        className={`flex w-full items-end gap-3 ${isUser ? "justify-start" : "justify-end"
          }`}
      >
        {!isUser && (
          <div className="flex gap-3 items-end justify-end">
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-lg transition-all duration-300 whitespace-pre-line ${isUser
                ? "bg-primaryThemeColor text-darkThemeColor rounded-br-none text-right"
                : "bg-darkThemeColor text-primaryTextColor border border-borderColor rounded-bl-none text-right"
                }`}
            >
              <p className="text-right">{message.content}</p>
            </div>

            <div className="size-9 rounded-full bg-primaryThemeColor/20 border border-primaryThemeColor/40 flex items-center justify-center text-primaryThemeColor shadow-lg shadow-primaryThemeColor/10">
              <i className="fi fi-rr-robot h-4 block"></i>
            </div>
          </div>
        )}

        {isUser && (
          <div className="flex gap-3 items-end">
            <div className="size-9 rounded-full bg-primaryThemeColor text-darkThemeColor flex items-center justify-center shadow-lg shadow-primaryThemeColor/20">
              <i className="fi fi-rr-user h-4 block"></i>
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-lg transition-all duration-300 whitespace-pre-line ${isUser
                ? "bg-primaryThemeColor text-darkThemeColor rounded-br-none text-right"
                : "bg-darkThemeColor text-primaryTextColor border border-borderColor rounded-bl-none text-right"
                }`}
            >
              <p className="text-right">{message.content}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b2027] via-[#181c22] to-[#101318] border border-borderColor/40 p-8 md:p-12 relative overflow-hidden group">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, rgba(23,201,100,0.3), transparent 40%), radial-gradient(circle at 80% 70%, rgba(23,201,100,0.2), transparent 50%)",
            }}
          />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primaryThemeColor/10 blur-xl animate-float"
              style={{
                width: `${20 + i * 10}px`,
                height: `${20 + i * 10}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primaryThemeColor/20 via-primaryThemeColor/10 to-transparent blur-xl"></div>
        </div>

        <div className="w-full relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Right side - Animated Image */}
          <div
            className={`w-full md:w-fit flex justify-center md:justify-start order-2 md:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-4 md:translate-x-8' : 'opacity-0 translate-x-10'
              }`}
          >
            <div className="relative w-full max-w-[450px] aspect-square">
              {/* Multiple outer glow rings */}
              <div className="absolute inset-0 bg-gradient-to-br from-primaryThemeColor/40 to-primaryThemeColor/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Rotating gradient rings */}
              <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ animationDuration: '25s' }}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primaryThemeColor/30 to-transparent"></div>
              </div>
              <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-l from-transparent via-primaryThemeColor/20 to-transparent"></div>
              </div>

              <div className="relative w-full h-full flex items-center justify-center">
                {/* Animated Wave Behind Circle - Visible from corners */}
                <div className="absolute inset-0 -z-10 overflow-visible">
                  <div className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%]">
                    <svg
                      className="absolute inset-0 w-full h-full animate-spin-slow opacity-70"
                      style={{ animationDuration: '15s' }}
                      viewBox="0 0 500 500"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(23, 201, 100, 0.5)" />
                          <stop offset="50%" stopColor="rgba(23, 201, 100, 0.8)" />
                          <stop offset="100%" stopColor="rgba(23, 201, 100, 0.5)" />
                        </linearGradient>
                      </defs>
                      {/* Multiple wave paths visible from corners */}
                      <path
                        d="M 50,250 Q 150,180 250,250 T 450,250"
                        fill="none"
                        stroke="url(#waveGradient)"
                        strokeWidth="5"
                        className="animate-pulse-slow"
                      />
                      <path
                        d="M 50,250 Q 150,320 250,250 T 450,250"
                        fill="none"
                        stroke="url(#waveGradient)"
                        strokeWidth="5"
                        className="animate-pulse-slow"
                        style={{ animationDelay: '1s' }}
                      />
                      <path
                        d="M 50,220 Q 150,150 250,220 T 450,220"
                        fill="none"
                        stroke="url(#waveGradient)"
                        strokeWidth="4"
                        opacity="0.7"
                        className="animate-pulse-slow"
                        style={{ animationDelay: '0.5s' }}
                      />
                      <path
                        d="M 50,280 Q 150,350 250,280 T 450,280"
                        fill="none"
                        stroke="url(#waveGradient)"
                        strokeWidth="4"
                        opacity="0.7"
                        className="animate-pulse-slow"
                        style={{ animationDelay: '1.5s' }}
                      />
                      <path
                        d="M 50,200 Q 150,130 250,200 T 450,200"
                        fill="none"
                        stroke="url(#waveGradient)"
                        strokeWidth="3"
                        opacity="0.6"
                        className="animate-pulse-slow"
                        style={{ animationDelay: '0.3s' }}
                      />
                      <path
                        d="M 50,300 Q 150,370 250,300 T 450,300"
                        fill="none"
                        stroke="url(#waveGradient)"
                        strokeWidth="3"
                        opacity="0.6"
                        className="animate-pulse-slow"
                        style={{ animationDelay: '1.2s' }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Main circle with enhanced gradient border */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primaryThemeColor/20 via-primaryThemeColor/10 to-primaryThemeColor/5 border-4 border-primaryThemeColor/40 flex items-center justify-center overflow-hidden relative group/robot shadow-2xl shadow-primaryThemeColor/30">
                  {/* Animated inner glow layers */}
                  <div className="absolute inset-0 rounded-full bg-primaryThemeColor/15 animate-ping" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute inset-2 rounded-full bg-primaryThemeColor/10 animate-pulse" style={{ animationDuration: '2s' }}></div>

                  <div className="relative size-72 md:size-96 rounded-full bg-gradient-to-br from-primaryThemeColor/25 via-primaryThemeColor/15 to-primaryThemeColor/5 flex items-center justify-center backdrop-blur-md border-2 border-primaryThemeColor/30 overflow-hidden">
                    {/* Image inside circle */}
                    <div className="relative w-full h-full flex items-center justify-center group-hover/robot:scale-110 transition-transform duration-500">
                      <Image
                        src="/assets/123.png"
                        alt="Consultation Chat"
                        width={400}
                        height={400}
                        className="w-full h-full object-contain rounded-full p-4"
                        priority
                      />
                      {/* Image glow overlay */}
                      <div className="absolute inset-0 rounded-full bg-primaryThemeColor/10 blur-2xl group-hover/robot:bg-primaryThemeColor/20 transition-colors duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left side - Content with animations */}
          <div
            className={`w-full md:w-fit flex flex-col gap-6 order-1 md:order-2 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
          >
              <div className="flex flex-col gap-4">
                {/* Title with icon animation */}
                <div className="flex items-center gap-3 group/title">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/10 border border-primaryThemeColor/30 flex items-center justify-center text-primaryThemeColor text-2xl shadow-lg shadow-primaryThemeColor/20 group-hover/title:scale-110 group-hover/title:rotate-12 transition-all duration-300">
                    <i className="fi fi-rr-robot block h-6 animate-pulse-slow"></i>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-primaryTextColor bg-gradient-to-r from-primaryTextColor to-primaryTextColor/80 bg-clip-text group-hover/title:scale-105 transition-transform duration-300">
                    دستیار هوشمند مشاوره
                  </h3>
                </div>

                {/* Description with fade in */}
                <p className="text-base md:text-lg text-secondaryTextColor leading-7 max-w-[500px] animate-fade-in">
                  با استفاده از هوش مصنوعی پیشرفته، می‌توانید به صورت آنلاین با دستیار هوشمند ما صحبت کنید و پاسخ‌های فوری و تخصصی دریافت کنید.
                </p>
              </div>

              {/* Buttons with hover effects */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={() => setShowFullChat(true)}
                  className="group/btn relative px-6 py-3 bg-primaryThemeColor text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 text-center shadow-lg shadow-primaryThemeColor/20 hover:shadow-primaryThemeColor/40 hover:scale-105"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    شروع مشاوره
                    <i className="fi fi-rr-arrow-left block h-4 group-hover/btn:translate-x-1 transition-transform"></i>
                  </span>
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="group/btn2 relative px-6 py-3 bg-darkThemeColor border-2 border-borderColor/50 text-primaryTextColor rounded-xl font-semibold overflow-hidden transition-all duration-300 text-center hover:border-primaryThemeColor/70 hover:bg-primaryThemeColor/5 hover:scale-105"
                >
                  {/* Border glow on hover */}
                  <div className="absolute inset-0 rounded-xl bg-primaryThemeColor/10 opacity-0 group-hover/btn2:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    مشاهده نمونه
                    <i className="fi fi-rr-eye block h-4 group-hover/btn2:scale-110 transition-transform"></i>
                  </span>
                </button>
              </div>

              {/* Features with stagger animation */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { icon: "fi-rr-bolt", text: "پاسخ فوری" },
                  { icon: "fi-rr-calendar-check", text: "رزرو خودکار نوبت" },
                  { icon: "fi-rr-clock", text: "24/7 در دسترس" }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-secondaryTextColor group/feature hover:text-primaryThemeColor transition-colors duration-300"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1 + 0.4}s both`
                    }}
                  >
                    <i className={`fi ${feature.icon} block h-3 text-primaryThemeColor group-hover/feature:scale-125 transition-transform duration-300`}></i>
                    <span className="group-hover/feature:translate-x-1 transition-transform duration-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Preview Chat Modal */}
      {showChat && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowChat(false)}>
        <div className="w-full max-w-2xl bg-darkThemeColor rounded-3xl border border-borderColor/40 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center text-primaryThemeColor">
                <i className="fi fi-rr-robot block h-4 text-base"></i>
              </div>
              <h3 className="text-xl font-black text-primaryTextColor">دستیار هوشمند مشاوره</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="size-8 rounded-lg bg-secondaryThemeColor hover:bg-secondaryThemeColor/80 flex items-center justify-center text-secondaryTextColor transition-colors"
            >
              <i className="fi fi-rr-cross-small block h-4"></i>
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-secondaryThemeColor rounded-2xl p-4">
              <p className="text-secondaryTextColor text-sm leading-6">
                سلام! من دستیار هوشمند یاریجو هستم. 👋
                <br /><br />
                می‌توانم به شما کمک کنم تا:
                <br />• درباره نگرانی‌ها و احساساتتان صحبت کنیم
                <br />• بهترین مشاور را برای شما پیشنهاد دهم
                <br />• نوبت مشاوره را برایتان رزرو کنم
              </p>
            </div>
            <button
              onClick={() => {
                setShowChat(false);
                setShowFullChat(true);
              }}
              className="w-full px-6 py-3 bg-primaryThemeColor text-white rounded-xl font-semibold hover:bg-primaryThemeColor/90 transition-all text-center"
            >
              شروع مشاوره کامل
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Full Chat Modal */}
      {showFullChat && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowFullChat(false)}>
        <div className="w-full max-w-4xl bg-gradient-to-br from-[#1b2027] via-[#181c22] to-[#101318] rounded-3xl border border-borderColor/40 p-6 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderColor/30">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center text-primaryThemeColor text-xl">
                <i className="fi fi-rr-robot block h-5"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-primaryTextColor">دستیار هوشمند مشاوره</h3>
                <p className="text-xs text-secondaryTextColor flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryThemeColor opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primaryThemeColor"></span>
                  </span>
                  آنلاین و آماده پاسخگویی
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFullChat(false)}
              className="size-10 rounded-lg bg-secondaryThemeColor hover:bg-secondaryThemeColor/80 flex items-center justify-center text-secondaryTextColor transition-colors"
            >
              <i className="fi fi-rr-cross-small block h-[18px] text-lg"></i>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4 p-4 bg-darkThemeColor/50 rounded-2xl border border-borderColor/30 scrollbar-thin scrollbar-thumb-primaryThemeColor/25 scrollbar-track-transparent">
            <div className="space-y-4">
              {messages.map(renderMessage)}

              {isSending && (
                <div className="flex w-full justify-center">
                  <div className="flex items-center gap-2 rounded-2xl bg-darkThemeColor px-4 py-3 border border-borderColor/40 text-sm text-secondaryTextColor">
                    <Spinner color="success" size="sm" />
                    <span>در حال دریافت پاسخ...</span>
                  </div>
                </div>
              )}
              {isBooking && (
                <div className="flex w-full justify-center">
                  <div className="flex items-center gap-2 rounded-2xl bg-primaryThemeColor/20 px-4 py-3 border border-primaryThemeColor/40 text-sm text-primaryThemeColor">
                    <Spinner color="success" size="sm" />
                    <span>در حال ثبت نوبت...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onValueChange={setInputMessage}
                placeholder="سوال یا احساس خود را اینجا بنویسید..."
                radius="lg"
                variant="bordered"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                classNames={{
                  inputWrapper:
                    "bg-darkThemeColor/40 border-borderColor/60 hover:border-primaryThemeColor/40",
                  input: "text-primaryTextColor",
                }}
              />
              <Button
                color="success"
                radius="lg"
                onPress={handleSendMessage}
                isDisabled={isSending || isBooking || !inputMessage.trim()}
                className="min-w-[120px] font-semibold"
                isLoading={isSending}
              >
                {isSending ? "ارسال..." : "ارسال"}
              </Button>
            </div>
            <p className="text-xs text-secondaryTextColor text-center">
              برای دریافت پاسخ دقیق‌تر، سوال خود را با جزئیات بنویسید
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ConsultationChat;
