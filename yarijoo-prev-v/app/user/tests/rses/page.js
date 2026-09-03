"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeart } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("rses");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "احساس می‌کنم فردی با ارزش هستم", reverse: false },
    { text: "احساس می‌کنم ویژگی‌های خوبی دارم", reverse: false },
    { text: "در کل، احساس شکست می‌کنم", reverse: true },
    { text: "می‌توانم کارها را به خوبی دیگران انجام دهم", reverse: false },
    { text: "احساس می‌کنم چیز زیادی برای افتخار ندارم", reverse: true },
    { text: "نگرش مثبتی به خودم دارم", reverse: false },
    { text: "در کل، از خودم راضی هستم", reverse: false },
    { text: "آرزو می‌کردم بیشتر به خودم احترام بگذارم", reverse: true },
    { text: "گاهی احساس بی‌فایده بودن می‌کنم", reverse: true },
    { text: "گاهی فکر می‌کنم اصلاً خوب نیستم", reverse: true }
  ];

  const options = [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "موافقم" },
    { value: 4, label: "کاملاً موافقم" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (5 - value) : value;
    setAnswers({ ...answers, [currentQuestion]: actualValue });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else setIsCompleted(true);
  };

  const calculateScore = () => Object.values(answers).reduce((sum, score) => sum + score, 0);

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        
        const score = calculateScore();
        const interpretation = getInterpretation(score);

        
        try {
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => { const answer = answers[idx]; return answer !== undefined ? answer : 0; });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: score,
            total_score: score,
            level: interpretation.level,
            interpretation: interpretation,
          });
          
          if (saved && saved.success) {
            setSavedScore(score);
            setIsCompleted(true);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, hasResult, answers, questions, saveResult]);


  const getInterpretation = (score) => {
    if (score <= 15) {
      return {
        level: "پایین",
        color: "#ef4444",
        desc: "عزت نفس پایین - نیاز به بهبود و تقویت دارد.",
        details: "نمره شما نشان می‌دهد که عزت نفس پایینی دارید. این می‌تواند بر عملکرد، روابط و رفاه کلی شما تأثیر بگذارد. عزت نفس پایین می‌تواند منجر به افسردگی، اضطراب، مشکلات روابط و کاهش عملکرد شود.",
        strengths: [
          "آگاهی از مشکل",
          "پتانسیل بهبود"
        ],
        recommendations: [
          "کار کردن با روان‌شناس برای تقویت عزت نفس",
          "شناسایی و تغییر افکار منفی درباره خود",
          "تمرین خوددلسوزی و پذیرش خود",
          "تعیین اهداف واقع‌بینانه و کوچک",
          "احاطه خود با افراد مثبت و حمایت‌کننده",
          "یادگیری مهارت‌های مقابله‌ای و حل مسئله"
        ]
      };
    }
    if (score <= 25) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "عزت نفس در محدوده متوسط - قابل بهبود.",
        details: "عزت نفس شما در محدوده متوسط است. شما برخی ویژگی‌های مثبت دارید اما با تمرین و تلاش می‌توانید آن را تقویت کنید. بهبود عزت نفس می‌تواند کیفیت زندگی شما را افزایش دهد.",
        strengths: [
          "برخی ویژگی‌های مثبت",
          "امکان تقویت",
          "پایه خوب برای رشد"
        ],
        recommendations: [
          "تمرین شناسایی نقاط قوت خود",
          "تعیین اهداف قابل دستیابی و جشن گرفتن موفقیت‌ها",
          "مراقبت از خود و فعالیت‌های لذت‌بخش",
          "یادگیری رد کردن انتقاد سازنده از انتقاد مخرب",
          "تمرین قدردانی و مثبت‌اندیشی"
        ]
      };
    }
    return {
      level: "بالا",
      color: "#22c55e",
      desc: "عزت نفس بالا - نشانه مثبت و سالم است.",
      details: "نمره شما نشان می‌دهد که عزت نفس بالایی دارید. این یک نشانه مثبت و سالم است که نشان‌دهنده دیدگاه مثبت نسبت به خود است. عزت نفس بالا با رضایت بیشتر از زندگی، عملکرد بهتر، روابط سالم‌تر و سلامت روان بهتر همراه است.",
      strengths: [
        "عزت نفس قوی",
        "دیدگاه مثبت نسبت به خود",
        "اعتماد به نفس خوب",
        "احساس ارزشمندی",
        "کیفیت زندگی خوب"
      ],
      recommendations: [
        "حفظ عادت‌های سالم و مثبت",
        "ادامه فعالیت‌هایی که احساس ارزشمندی ایجاد می‌کند",
        "کمک به دیگران و مشارکت در جامعه",
        "حفظ روابط سالم و مثبت",
        "یادگیری و رشد مداوم"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 15) {
      return [
        "کار کردن با روان‌شناس برای تقویت عزت نفس",
        "شناسایی و تغییر افکار منفی درباره خود",
        "تمرین خوددلسوزی و پذیرش خود",
        "تعیین اهداف واقع‌بینانه و کوچک",
        "احاطه خود با افراد مثبت و حمایت‌کننده",
        "یادگیری مهارت‌های مقابله‌ای و حل مسئله"
      ];
    }
    if (score <= 25) {
      return [
        "تمرین شناسایی نقاط قوت خود",
        "تعیین اهداف قابل دستیابی و جشن گرفتن موفقیت‌ها",
        "مراقبت از خود و فعالیت‌های لذت‌بخش",
        "یادگیری رد کردن انتقاد سازنده از انتقاد مخرب",
        "تمرین قدردانی و مثبت‌اندیشی"
      ];
    }
    return [
      "حفظ عادت‌های سالم و مثبت",
      "ادامه فعالیت‌هایی که احساس ارزشمندی ایجاد می‌کند",
      "کمک به دیگران و مشارکت در جامعه",
      "حفظ روابط سالم و مثبت",
      "یادگیری و رشد مداوم"
    ];
  };

  // نمایش loading
  if (resultLoading) {
    return (
      <div className="w-full flex flex-col items-center min-h-screen justify-center">
        <div className="text-primaryTextColor">در حال بررسی...</div>
      </div>
    );
  }


  if (isCompleted) {
    // استفاده از نمره ذخیره شده یا محاسبه شده
    const score = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculateScore());
    const interpretation = getInterpretation(score);
    const maxScore = 40;
    const chartData = {
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'عزت نفس',
        data: [score, 15, 25, 40],
        backgroundColor: [interpretation.color + 'B3', 'rgba(239, 68, 68, 0.3)', 'rgba(234, 179, 8, 0.3)', 'rgba(34, 197, 94, 0.3)'],
        borderColor: [interpretation.color, 'rgb(239, 68, 68)', 'rgb(234, 179, 8)', 'rgb(34, 197, 94)'],
        borderWidth: 2
      }]
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس عزت نفس روزنبرگ</h1>
                <p className="text-secondaryTextColor">RSES</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 40</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح عزت نفس</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, title: { display: true, text: 'مقیاس عزت نفس', color: '#e5e7eb', font: { size: 16 } } },
                  scales: { y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } } }
                }} />
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {getRecommendations(score).map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">درباره نمرات</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">10-15: عزت نفس پایین</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">16-25: عزت نفس متوسط</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-secondaryTextColor">26-40: عزت نفس بالا</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره RSES</h4>
              <p className="text-sm text-blue-300">مقیاس عزت نفس روزنبرگ (RSES) یک ابزار 10 سوالی برای سنجش عزت نفس کلی است. این تست پرکاربردترین ابزار سنجش عزت نفس در جهان است.</p>
            </div>
            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد تست</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس عزت نفس روزنبرگ</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>
          <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >
              {questions[currentQuestion].text}
            </h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button 
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)} 
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
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







