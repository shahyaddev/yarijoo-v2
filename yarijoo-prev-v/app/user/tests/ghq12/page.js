"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartbeat } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ghq12");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = ["توانسته‌اید روی کارهایتان تمرکز کنید؟","به دلیل نگرانی‌ها خواب خود را از دست داده‌اید؟","احساس کرده‌اید که نقش مفیدی ایفا می‌کنید؟","احساس کرده‌اید در تصمیم‌گیری توانایی دارید؟","احساس فشار مداوم کرده‌اید؟","احساس کرده‌اید نمی‌توانید با مشکلات کنار بیایید؟","توانسته‌اید از فعالیت‌های روزمره لذت ببرید؟","توانسته‌اید با مشکلات رو به رو شوید؟","احساس ناخوشی و افسردگی کرده‌اید؟","اعتماد به نفس خود را از دست داده‌اید؟","به خود به عنوان فرد بی‌ارزشی فکر کرده‌اید؟","احساس شادی نسبی کرده‌اید؟"];

  const options = [{ value: 0, label: "بهتر از همیشه" },{ value: 1, label: "مثل همیشه" },{ value: 2, label: "کمتر از همیشه" },{ value: 3, label: "خیلی کمتر" }];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else setIsCompleted(true);
  };

  const calculateScore = () => {
    const reverseItems = [2, 5, 6, 11];
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      const answerValue = answers[i] || 0;
      if (reverseItems.includes(i)) {
        if (answerValue >= 2) score += 1;
      } else {
        if (answerValue >= 2) score += 1;
      }
    }
    return score;
  };

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
    if (score <= 2) {
      return {
        level: "سلامت روانی خوب",
        color: "#22c55e",
        desc: "سلامت روانی در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که سلامت روانی در حد طبیعی است و مشکلات قابل توجهی مشاهده نمی‌شود. این یک نشانه مثبت از سلامت روانی است.",
        strengths: [
          "سلامت روانی خوب",
          "عملکرد مناسب",
          "کیفیت زندگی خوب",
          "عدم مشکلات قابل توجه"
        ],
        recommendations: [
          "حفظ سبک زندگی سالم",
          "ادامه فعالیت‌های مثبت",
          "پایش منظم سلامت روانی"
        ]
      };
    }
    if (score <= 4) {
      return {
        level: "مشکلات خفیف",
        color: "#84cc16",
        desc: "مشکلات خفیف سلامت روانی که نیاز به توجه دارد.",
        details: "علائم خفیفی از مشکلات سلامت روانی در شما مشاهده می‌شود که نیاز به توجه دارد. این قابل کنترل است.",
        strengths: [
          "برخی مهارت‌های مقابله",
          "آگاهی از مشکل"
        ],
        recommendations: [
          "یادگیری تکنیک‌های مدیریت استرس",
          "افزایش فعالیت‌های لذت‌بخش",
          "مشاوره اولیه با روان‌شناس",
          "تقویت حمایت اجتماعی"
        ]
      };
    }
    return {
      level: "مشکلات قابل توجه",
      color: "#ef4444",
      desc: "مشکلات قابل توجه سلامت روانی که نیاز به ارزیابی دارد.",
      details: "نمره شما نشان می‌دهد که مشکلات قابل توجهی در سلامت روانی وجود دارد. این می‌تواند بر عملکرد روزانه تأثیر بگذارد. ارزیابی تخصصی توصیه می‌شود.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: [
        "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی",
        "بررسی احتمال اختلالات روانی",
        "درمان مناسب در صورت نیاز",
        "ایجاد سیستم حمایتی قوی"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 2) {
      return [
        "حفظ سبک زندگی سالم",
        "ادامه فعالیت‌های مثبت",
        "پایش منظم سلامت روانی"
      ];
    }
    if (score <= 4) {
      return [
        "یادگیری تکنیک‌های مدیریت استرس",
        "افزایش فعالیت‌های لذت‌بخش",
        "مشاوره اولیه با روان‌شناس",
        "تقویت حمایت اجتماعی"
      ];
    }
    return [
      "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی",
      "بررسی احتمال اختلالات روانی",
      "درمان مناسب در صورت نیاز",
      "ایجاد سیستم حمایتی قوی"
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
    const maxScore = 12;

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaHeartbeat className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه سلامت عمومی</h1>
                <p className="text-secondaryTextColor">GHQ-12</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 12</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">وضعیت</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>
            {score > 2 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">نمره شما نشان‌دهنده مشکلات سلامت روانی است. ارزیابی تخصصی توصیه می‌شود.</p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره GHQ-12</h4>
              <p className="text-sm text-blue-300">
                پرسشنامه سلامت عمومی (GHQ-12) یک ابزار 12 سوالی برای غربالگری مشکلات سلامت روانی است. 
                نمره 3 یا بالاتر نشان‌دهنده نیاز به ارزیابی بیشتر است. برخی سوالات به صورت معکوس نمره‌دهی می‌شوند.
              </p>
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
              <FaHeartbeat className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه سلامت عمومی</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >در هفته‌های اخیر:</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
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







