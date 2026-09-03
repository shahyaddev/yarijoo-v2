"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaLightbulb } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("iq_verbal");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = [
    {
      q: "واژه مترادف 'سریع' چیست؟",
      options: [
        { text: "تند", correct: true },
        { text: "آهسته", correct: false },
        { text: "بزرگ", correct: false },
        { text: "کوچک", correct: false }
      ]
    },
    {
      q: "واژه متضاد 'بزرگ' چیست؟",
      options: [
        { text: "کوچک", correct: true },
        { text: "بلند", correct: false },
        { text: "عظیم", correct: false },
        { text: "وسیع", correct: false }
      ]
    },
    {
      q: "کدام واژه در این گروه نمی‌گنجد؟",
      options: [
        { text: "هویج", correct: true },
        { text: "سیب", correct: false },
        { text: "موز", correct: false },
        { text: "پرتقال", correct: false }
      ]
    },
    {
      q: "جمله را کامل کنید: او ... به مدرسه رفت.",
      options: [
        { text: "دیروز", correct: true },
        { text: "فردا", correct: false },
        { text: "سال", correct: false },
        { text: "ماه", correct: false }
      ]
    },
    {
      q: "معنی 'خوشحال' چیست؟",
      options: [
        { text: "شاد", correct: true },
        { text: "غمگین", correct: false },
        { text: "عصبانی", correct: false },
        { text: "ترسیده", correct: false }
      ]
    },
    {
      q: "اگر 'کتاب' به 'خواندن' مربوط است، 'غذا' به چه چیزی مربوط است؟",
      options: [
        { text: "خوردن", correct: true },
        { text: "نوشتن", correct: false },
        { text: "دیدن", correct: false },
        { text: "شنیدن", correct: false }
      ]
    },
    {
      q: "مترادف 'زیبا' چیست؟",
      options: [
        { text: "قشنگ", correct: true },
        { text: "زشت", correct: false },
        { text: "سرد", correct: false },
        { text: "گرم", correct: false }
      ]
    },
    {
      q: "ضرب‌المثل را کامل کنید: 'نان به نرخ روز ...'",
      options: [
        { text: "خریدن", correct: true },
        { text: "فروختن", correct: false },
        { text: "پختن", correct: false },
        { text: "خوردن", correct: false }
      ]
    },
    {
      q: "متضاد 'بالا' چیست؟",
      options: [
        { text: "پایین", correct: true },
        { text: "بلند", correct: false },
        { text: "کوتاه", correct: false },
        { text: "وسط", correct: false }
      ]
    },
    {
      q: "کدام جمله از نظر دستوری صحیح است؟",
      options: [
        { text: "من به مدرسه می‌روم", correct: true },
        { text: "من مدرسه می‌رو به", correct: false },
        { text: "به می‌روم من مدرسه", correct: false },
        { text: "مدرسه من به می‌رود", correct: false }
      ]
    }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (correct) => {
    const newAnswers = { ...answers, [currentQuestion]: correct ? 1 : 0 };
    setAnswers(newAnswers);

    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
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
    const maxScore = 10;
    const percentage = (score / maxScore) * 100;
    const iq = Math.round(70 + (percentage / 100) * 60);
    
    if (score <= 3) {
      return {
        level: "هوش کلامی پایین",
        color: "#ef4444",
        iq: `${iq} (±10)`,
        desc: "هوش کلامی شما در سطح پایینی قرار دارد.",
        details: "نمره شما نشان می‌دهد که مهارت‌های کلامی شما نیاز به تقویت دارد. این می‌تواند بر یادگیری و ارتباطات تأثیر بگذارد.",
        strengths: [],
        recommendations: [
          "**خواندن**: افزایش زمان خواندن",
          "**واژگان**: یادگیری واژگان جدید",
          "**تمرین**: تمرین سوالات کلامی",
          "**مشاوره**: مشاوره برای بهبود مهارت‌های کلامی"
        ]
      };
    } else if (score <= 6) {
      return {
        level: "هوش کلامی متوسط",
        color: "#eab308",
        iq: `${iq} (±10)`,
        desc: "هوش کلامی شما در سطح متوسط است.",
        details: "شما مهارت‌های کلامی متوسطی دارید. با تمرین می‌توانید بهتر شوید.",
        strengths: ["مهارت‌های پایه"],
        recommendations: [
          "**تمرین بیشتر**: تمرین بیشتر مهارت‌های کلامی",
          "**خواندن**: خواندن متون متنوع",
          "**واژگان**: گسترش دایره واژگان"
        ]
      };
    } else {
      return {
        level: "هوش کلامی بالا",
        color: "#22c55e",
        iq: `${iq} (±10)`,
        desc: "هوش کلامی شما خوب است.",
        details: "تبریک! شما مهارت‌های کلامی خوبی دارید. این نشان می‌دهد که توانایی درک و استفاده از زبان در شما قوی است.",
        strengths: ["مهارت‌های کلامی قوی", "درک زبان", "استفاده مؤثر از کلمات"],
        recommendations: [
          "**حفظ**: ادامه حفظ و تقویت مهارت‌ها",
          "**چالش‌های جدید**: جستجوی چالش‌های کلامی جدید",
          "**کمک به دیگران**: کمک به بهبود مهارت‌های کلامی دیگران"
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
    const maxScore = questionsData.length;

    const chartData = {
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'نمره تست',
        data: [score, maxScore * 0.33, maxScore * 0.66, maxScore],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
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
                <FaLightbulb className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست هوش کلامی</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
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
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                {interpretation.iq && <div className="text-sm font-medium text-primaryTextColor mb-1">IQ تخمینی: {interpretation.iq}</div>}
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره هوش کلامی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
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
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
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
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaLightbulb className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست هوش کلامی (IQ Verbal)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questionsData.length}</p>
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
            >{questionsData[currentQuestion].q}</h3>
            <div className="space-y-3">
              {questionsData[currentQuestion].options.map((option, idx) => (
                <button key={idx} onClick={() => handleAnswer(option.correct)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
                  <span className="text-primaryTextColor font-medium">{option.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questionsData.length) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questionsData.length) * 100}%` }}></div>
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