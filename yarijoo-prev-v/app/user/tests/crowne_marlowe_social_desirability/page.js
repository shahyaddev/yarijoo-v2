"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserCheck } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("crowne_marlowe_social_desirability");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "همیشه آماده پذیرفتن اشتباهاتم هستم", reverse: false },
    { text: "گاهی سعی می‌کنم انتقام بگیرم به جای بخشیدن", reverse: true },
    { text: "همیشه با همه مؤدب هستم حتی افراد ناخوشایند", reverse: false },
    { text: "هرگز از حسادت به خوشبختی دیگران رنج نبرده‌ام", reverse: false },
    { text: "گاهی به جای انجام کار، به آن فکر می‌کنم", reverse: true },
    { text: "هرگز عمداً چیزی نگفتم که احساسات کسی را جریحه‌دار کند", reverse: false },
    { text: "گاهی عصبانی می‌شوم", reverse: true },
    { text: "هرگز سوءاستفاده از کسی نکرده‌ام", reverse: false },
    { text: "همیشه قوانین را رعایت می‌کنم", reverse: false },
    { text: "گاهی حرص می‌خورم", reverse: true },
    { text: "هرگز دروغ نگفته‌ام", reverse: false },
    { text: "همیشه می‌گویم لطفاً و متشکرم", reverse: false },
    { text: "گاهی از انجام کار درست طفره می‌روم", reverse: true }
  ];

  const options = [
    { value: 0, label: "نادرست" },
    { value: 1, label: "درست" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      const answer = answers[index];
      if (answer !== undefined) {
        if (q.reverse) {
          // برای سوالات معکوس، اگر "نادرست" (0) گفته باشد = پاسخ مطلوب
          score += (answer === 0 ? 1 : 0);
        } else {
          // برای سوالات عادی، اگر "درست" (1) گفته باشد = پاسخ مطلوب
          score += (answer === 1 ? 1 : 0);
        }
      }
    });
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
    const maxScore = 13;
    const percentage = (score / maxScore) * 100;
    
    if (score <= 4) {
      return {
        level: "پایین",
        color: "#22c55e",
        desc: "مطلوبیت اجتماعی پایین - پاسخ‌های صادقانه",
        details: "نمره شما نشان می‌دهد که تمایل پایینی به ارائه پاسخ‌های مطلوب اجتماعی دارید. این به معنای صادقانه‌تر بودن در پاسخ‌ها است. شما احتمالاً در تست‌های دیگر نیز پاسخ‌های واقعی‌تری می‌دهید.",
        strengths: [
          "صداقت بالا در پاسخ‌ها",
          "عدم نیاز به تایید اجتماعی",
          "اعتماد به نفس در بیان واقعیت",
          "صادقانه بودن در تست‌ها"
        ],
        recommendations: [
          "حفظ این سطح از صداقت در پاسخ‌ها",
          "توجه به اینکه پاسخ‌های صادقانه در تست‌های دیگر نیز مفید است",
          "ادامه رفتار صادقانه در موقعیت‌های مختلف"
        ]
      };
    } else if (score <= 8) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "مطلوبیت اجتماعی متوسط",
        details: "نمره شما نشان می‌دهد که تمایل متوسطی به ارائه پاسخ‌های مطلوب اجتماعی دارید. شما تا حدی صادق هستید اما گاهی ممکن است به طور ناخودآگاه پاسخ‌هایی که از نظر اجتماعی مطلوب‌تر هستند را انتخاب کنید.",
        strengths: [
          "تعادل نسبی بین صداقت و مطلوبیت اجتماعی",
          "برخی مهارت‌های اجتماعی",
          "آگاهی از نرم‌های اجتماعی"
        ],
        recommendations: [
          "تمرین خودآگاهی بیشتر در پاسخ‌ها",
          "سعی در صداقت بیشتر هنگام پاسخ به تست‌ها",
          "شناسایی مواقعی که ممکن است به طور ناخودآگاه پاسخ‌های مطلوب بدهید",
          "توجه به اینکه پاسخ‌های واقعی‌تر نتایج دقیق‌تری می‌دهند"
        ]
      };
    } else {
      return {
        level: "بالا",
        color: "#f97316",
        desc: "مطلوبیت اجتماعی بالا - تمایل به پاسخ‌های مطلوب",
        details: "نمره شما نشان می‌دهد که تمایل بالایی به ارائه پاسخ‌های مطلوب اجتماعی دارید. این می‌تواند به معنای تلاش ناخودآگاه برای ارائه تصویر بهتر از خود باشد. این ممکن است در تست‌های دیگر نیز بر نتایج تأثیر بگذارد.",
        strengths: [
          "آگاهی از نرم‌های اجتماعی",
          "مهارت‌های اجتماعی بالا",
          "حساسیت به انتظارات اجتماعی"
        ],
        recommendations: [
          "افزایش خودآگاهی در پاسخ به تست‌ها",
          "تمرین صداقت بیشتر هنگام پاسخ‌دهی",
          "در نظر گیری اینکه پاسخ‌های واقعی نتایج دقیق‌تری می‌دهند",
          "توجه به اینکه پاسخ‌های مطلوب ممکن است نتایج تست‌ها را تحریف کنند",
          "تمرین تفکر انتقادی قبل از پاسخ‌دهی"
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
    // استفاده از نمره ذخیره شده یا محاسبه شده
    const score = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculateScore());
    const interpretation = getInterpretation(score);
    const maxScore = 13;

    const chartData = {
      labels: ['نمره شما', 'پایین (0-4)', 'متوسط (5-8)', 'بالا (9-13)'],
      datasets: [{
        label: 'مطلوبیت اجتماعی',
        data: [score, 4, 8, 13],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(249, 115, 22, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 2
      }]
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header />
        <MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaUserCheck className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست مطلوبیت اجتماعی</h1>
                <p className="text-secondaryTextColor">مقیاس Crowne-Marlowe</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح مطلوبیت</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                  {interpretation.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره مطلوبیت اجتماعی و سطوح', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 13, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره مطلوبیت اجتماعی</h4>
              <p className="text-sm text-blue-300">
                مقیاس Crowne-Marlowe تمایل افراد به ارائه پاسخ‌های مطلوب اجتماعی را می‌سنجد. 
                نمرات بالا نشان می‌دهد که فرد ممکن است در تست‌ها پاسخ‌هایی که از نظر اجتماعی مطلوب‌تر هستند را انتخاب کند.
                این می‌تواند در تفسیر نتایج تست‌های دیگر مهم باشد.
              </p>
            </div>

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
      <Header />
      <MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaUserCheck className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست مطلوبیت اجتماعی</h1>
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