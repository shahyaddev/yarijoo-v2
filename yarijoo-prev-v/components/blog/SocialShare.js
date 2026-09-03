"use client";
import React, { useState } from "react";
import { FaTelegram, FaWhatsapp, FaTwitter, FaLinkedin } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const SocialShare = ({ title, url, description }) => {
  const [copied, setCopied] = useState(false);

  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title || '');
  const encodedDesc = encodeURIComponent(description || '');

  const shareLinks = {
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('لینک کپی شد!', {
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('خطا در کپی لینک');
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <Toaster />
      {/* Telegram */}
      <button
        onClick={() => handleShare('telegram')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0088cc]/10 text-[#0088cc] 
                   hover:bg-[#0088cc] hover:text-white transition-all duration-300 border border-[#0088cc]/30 
                   hover:border-[#0088cc] group"
      >
        <FaTelegram size={22} />
        <span className="text-sm font-semibold">اشتراک در تلگرام</span>
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#25D366]/10 text-[#25D366] 
                   hover:bg-[#25D366] hover:text-white transition-all duration-300 border border-[#25D366]/30 
                   hover:border-[#25D366] group"
      >
        <FaWhatsapp size={22} />
        <span className="text-sm font-semibold">اشتراک در واتساپ</span>
      </button>

      {/* Twitter */}
      <button
        onClick={() => handleShare('twitter')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1DA1F2]/10 text-[#1DA1F2] 
                   hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 border border-[#1DA1F2]/30 
                   hover:border-[#1DA1F2] group"
      >
        <FaTwitter size={22} />
        <span className="text-sm font-semibold">اشتراک در توییتر</span>
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0077B5]/10 text-[#0077B5] 
                   hover:bg-[#0077B5] hover:text-white transition-all duration-300 border border-[#0077B5]/30 
                   hover:border-[#0077B5] group"
      >
        <FaLinkedin size={22} />
        <span className="text-sm font-semibold">اشتراک در لینکدین</span>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border
                   ${copied 
                     ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                     : 'bg-primaryThemeColor/10 text-primaryThemeColor border-primaryThemeColor/30 hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor'
                   }`}
      >
        <i className={`fi ${copied ? 'fi-rr-check' : 'fi-rr-copy'} text-xl h-5`}></i>
        <span className="text-sm font-semibold">
          {copied ? 'لینک کپی شد!' : 'کپی لینک'}
        </span>
      </button>
    </div>
  );
};

export default SocialShare;


