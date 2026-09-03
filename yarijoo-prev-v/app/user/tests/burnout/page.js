"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaFire } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const questions = [
  { text: "احساس خستگی عاطفی می‌کنم", subscale: "exhaustion" },
  { text: "در پایان روز کاری احساس فرسودگی می‌کنم", subscale: "exhaustion" },
  { text: "صبح که بیدار می‌شوم و باید سر کار بروم خسته هستم", subscale: "exhaustion" },
  { text: "کار کردن تمام روز برایم سخت است", subscale: "exhaustion" },
  { text: "احساس می‌کنم انرژی‌ام تمام شده", subscale: "exhaustion" },
  { text: "نسبت به کارم بی‌تفاوت شده‌ام", subscale: "cynicism" },
  { text: "علاقه‌ام به کارم کم شده", subscale: "cynicism" },
  { text: "نسبت به اینکه کارم مفید است تردید دارم", subscale: "cynicism" },
  { text: "انگیزه کارم کم شده", subscale: "cynicism" },
  { text: "نسبت به کارم بدبین شده‌ام", subscale: "cynicism" },
  { text: "مشکلات کاری را به خوبی حل می‌کنم", subscale: "efficacy", reverse: true },
  { text: "به کارم مؤثر هستم", subscale: "efficacy", reverse: true },
  { text: "به چیزهای ارزشمندی در کارم دست می‌یابم", subscale: "efficacy", reverse: true },
  { text: "در کارم احساس کارآمدی می‌کنم", subscale: "efficacy", reverse: true },
  { text: "از دستاوردهایم در کار راضی هستم", subscale: "efficacy", reverse: true },
  { text: "اعتماد به نفس شغلی‌ام کم شده", subscale: "efficacy" }
];

const options = [
  { value: 0, label: "هرگز" },
  { value: 1, label: "چند بار در سال" },
  { value: 2, label: "ماهی یکبار" },
  { value: 3, label: "چند بار در ماه" },
  { value: 4, label: "هفته‌ای یکبار" },
  { value: 5, label: "چند بار در هفته" },
  { value: 6, label: "هر روز" }
];

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("burnout");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    let exhaustion = 0;
    let cynicism = 0;
    let efficacy = 0;
    const maxOptionValue = 6;

    questions.forEach((q, idx) => {
      const answerValue = answers[idx] || 0;
      let score = answerValue;
      
      if (q.reverse) {
        score = maxOptionValue - answerValue;
      }

      if (q.subscale === "exhaustion") {
        exhaustion += score;
      } else if (q.subscale === "cynicism") {
        cynicism += score;
      } else if (q.subscale === "efficacy") {
        efficacy += score;
      }
    });

    const totalBurnout = exhaustion + cynicism + (maxOptionValue * 6 - efficacy);
    
    return {
      exhaustion,
      cynicism,
      efficacy,
      totalBurnout
    };
  };

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        const scores = calculateScores();
        const score = scores.totalScore || scores.total_score || Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
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
            scores: scores
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


  const getInterpretation = (scores) => {
    const maxExhaustion = 30;
    const maxCynicism = 30;
    const maxEfficacy = 36;
    
    const exhaustionPercent = (scores.exhaustion / maxExhaustion) * 100;
    const cynicismPercent = (scores.cynicism / maxCynicism) * 100;
    const efficacyPercent = (scores.efficacy / maxEfficacy) * 100;
    const burnoutPercent = (scores.totalBurnout / 96) * 100;

    if (burnoutPercent < 30) {
      return {
        level: "فرسودگی پایین",
        color: "#22c55e",
        desc: "فرسودگی شغلی شما در حد پایین است و وضعیت مناسبی دارید.",
        details: "نمره شما نشان می‌دهد که خستگی عاطفی، بدبینی و کاهش کارآمدی در حد قابل قبولی است. شما می‌توانید با چالش‌های شغلی کنار بیایید.",
        strengths: [
          "سطح پایین خستگی عاطفی",
          "نگرش مثبت به کار",
          "کارآمدی شغلی مناسب",
          "تعادل کار-زندگی خوب",
          "انرژی و انگیزه کافی"
        ],
        recommendations: [
          "**حفظ وضعیت**: ادامه خودمراقبتی و تعادل کار-زندگی",
          "**پیشگیری**: توجه به علائم هشداردهنده فرسودگی",
          "**مرزگذاری**: حفظ مرزهای سالم بین کار و زندگی",
          "**فعالیت‌های مثبت**: ادامه فعالیت‌های کاهش‌دهنده استرس",
          "**حمایت**: حفظ شبکه حمایتی در محل کار"
        ]
      };
    } else if (burnoutPercent < 50) {
      return {
        level: "فرسودگی متوسط",
        color: "#eab308",
        desc: "نشانه‌های فرسودگی متوسط در شما مشاهده می‌شود. زمان مناسب برای اقدام است.",
        details: "برخی علائم فرسودگی در شما وجود دارد. خستگی عاطفی یا بدبینی افزایش یافته است. اکنون زمان مناسب برای پیشگیری و مدیریت است.",
        strengths: [
          "آگاهی از وضعیت",
          "انگیزه برای بهبود",
          "قابلیت تغییر"
        ],
        recommendations: [
          "**بازبینی تعادل**: بازبینی تعادل کار-زندگی و ایجاد تغییرات",
          "**تعیین مرزها**: تعیین مرزهای واضح‌تر در کار",
          "**استراحت**: استراحت‌های منظم در طول روز کاری",
          "**تعطیلات**: استفاده کامل از تعطیلات برای بازیابی",
          "**فعالیت‌های لذت‌بخش**: افزایش فعالیت‌های غیرکاری",
          "**صحبت با مدیر**: گفتگو درباره بار کاری و شرایط",
          "**اولویت‌بندی**: تمرکز بر کارهای مهم و ضروری",
          "**نه گفتن**: یادگیری نه گفتن به کارهای اضافی"
        ]
      };
    } else if (burnoutPercent < 75) {
      return {
        level: "فرسودگی بالا",
        color: "#f97316",
        desc: "فرسودگی شغلی شما در سطح بالایی است و نیاز به اقدامات جدی دارد.",
        details: "نمره بالا نشان می‌دهد که خستگی عاطفی شدید، بدبینی بالا و کاهش قابل توجه کارآمدی وجود دارد. این وضعیت می‌تواند بر سلامت جسمی و روانی شما تأثیر منفی بگذارد.",
        strengths: [],
        recommendations: [
          "**مشاوره فوری**: مشاوره با مشاور شغلی یا روانشناس",
          "**مرخصی**: گرفتن مرخصی برای بازیابی و استراحت",
          "**صحبت با مدیر**: گفتگوی صریح درباره شرایط کاری",
          "**تغییر وظایف**: در نظر گیری تغییر در نقش یا مسئولیت‌ها",
          "**حمایت همکاران**: ایجاد شبکه حمایتی در محل کار",
          "**مدیریت استرس**: یادگیری تکنیک‌های مدیریت استرس شغلی",
          "**خودمراقبتی جدی**: اولویت دادن به سلامت جسمی و روانی",
          "**ورزش**: فعالیت بدنی منظم برای کاهش استرس",
          "**تفریح**: جدایی کامل از کار در اوقات فراغت",
          "**مشاوره روانی**: دریافت کمک حرفه‌ای برای مدیریت احساسات"
        ]
      };
    } else {
      return {
        level: "فرسودگی بسیار بالا",
        color: "#dc2626",
        desc: "فرسودگی شدید! نیاز به مداخله فوری و درمان دارید.",
        details: "شما فرسودگی شدیدی دارید که می‌تواند به سلامت شما آسیب جدی بزند. احساس تخلیه کامل، بدبینی شدید و ناتوانی در انجام کارها وجود دارد. مداخله فوری ضروری است.",
        strengths: [],
        recommendations: [
          "**🚨 مداخله فوری**: مشاوره فوری با روانشناس یا روانپزشک",
          "**مرخصی طولانی**: گرفتن مرخصی استعلاجی یا مرخصی بدون حقوق",
          "**بررسی منابع**: شناسایی منابع اصلی استرس و فرسودگی",
          "**تغییر شغل**: در صورت امکان، در نظر گیری تغییر شغل یا سازمان",
          "**درمان**: دریافت درمان برای افسردگی یا اضطراب احتمالی",
          "**بررسی پزشکی**: معاینه پزشکی برای مشکلات جسمی احتمالی",
          "**حمایت کامل**: دریافت حمایت کامل از خانواده و دوستان",
          "**برنامه درمانی**: ایجاد برنامه درمانی ساختاریافته",
          "**⚠️ اگر افکار خودکشی دارید، فوراً کمک بگیرید**: 1480 یا 115"
        ]
      };
    }
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
    const scores = calculateScores();
    const interpretation = getInterpretation(scores);

    const chartData = {
      labels: ['خستگی عاطفی', 'بدبینی', 'کاهش کارآمدی'],
      datasets: [{
        label: 'نمرات زیرمقیاس‌ها',
        data: [scores.exhaustion, scores.cynicism, scores.efficacy],
        backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(249, 115, 22, 0.6)', 'rgba(234, 179, 8, 0.6)'],
        borderColor: ['rgb(239, 68, 68)', 'rgb(249, 115, 22)', 'rgb(234, 179, 8)'],
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
                <FaFire className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست فرسودگی شغلی مازلاک (MBI)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح فرسودگی</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">خستگی عاطفی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#ef4444' }}>{scores.exhaustion}</div>
                <div className="text-xs text-secondaryTextColor">از 30</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">بدبینی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#f97316' }}>{scores.cynicism}</div>
                <div className="text-xs text-secondaryTextColor">از 30</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">کاهش کارآمدی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#eab308' }}>{scores.efficacy}</div>
                <div className="text-xs text-secondaryTextColor">از 36</div>
              </div>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
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
                {interpretation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/🚨/g, '').replace(/⚠️/g, '') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار زیرمقیاس‌ها</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمرات زیرمقیاس‌های فرسودگی شغلی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 36, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {interpretation.level === "فرسودگی بسیار بالا" && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار مهم</h4>
                <p className="text-sm text-red-300 mb-2">
                  فرسودگی شدید می‌تواند منجر به مشکلات جدی سلامت شود. اگر افکار خودکشی یا آسیب‌رساندن به خود دارید، فوراً با خطوط کمک تماس بگیرید:
                </p>
                <p className="text-sm text-red-300 font-bold">
                  خط ملی پیشگیری از خودکشی: 1480 | اورژانس: 115
                </p>
              </div>
            )}

            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">
              انجام مجدد تست
            </button>
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
              <FaFire className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست فرسودگی شغلی مازلاک (MBI)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
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

export default TestPage;