"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBriefcase } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("work_motivation");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "کارم را دوست دارم",
  "از کارم لذت می‌برم",
  "کارم برایم جالب است",
  "کارم معنادار است",
  "به خاطر حقوق کار می‌کنم",
  "پاداش‌ها مرا انگیزه می‌دهد",
  "به خاطر ترفیع تلاش می‌کنم",
  "مزایا برایم مهم است",
  "اهداف شخصی در کار دارم",
  "کارم با ارزش‌هایم هماهنگ است",
  "خودم را با شغلم یکی می‌دانم",
  "باید کار کنم، چاره‌ای نیست",
  "دیگران انتظار دارند کار کنم",
  "احساس گناه می‌کنم اگر کار نکنم",
  "فشار بیرونی برای کار کردن دارم"
        ]

  const options = [
  {
    "value": 1,
    "label": "کاملاً مخالفم"
  },
  {
    "value": 2,
    "label": "مخالفم"
  },
  {
    "value": 3,
    "label": "نه موافق نه مخالف"
  },
  {
    "value": 4,
    "label": "موافقم"
  },
  {
    "value": 5,
    "label": "کاملاً موافقم"
  }
        ]

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    setAnswers({ ...answers, [currentQuestion]: { value, type: q.type } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const intrinsic = [0, 1, 2, 3].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const extrinsic = [4, 5, 6, 7].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const autonomous = [8, 9, 10].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const controlled = [11, 12, 13, 14].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const totalScore = intrinsic + extrinsic + autonomous + controlled;
    
    return { intrinsic, extrinsic, autonomous, controlled, totalScore };
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


  const getInterpretation = (score) => {
    const maxScore = 75;
    
    if (score <= 40) {
      return {
        level: "انگیزه کاری پایین",
        color: "#ef4444",
        desc: "انگیزه کاری شما پایین است.",
        details: "نمره پایین شما نشان می‌دهد که انگیزه کاری شما محدود است. این می‌تواند ناشی از عدم علاقه به کار، فرسودگی، یا عدم هماهنگی بین کار و ارزش‌های شما باشد.",
        strengths: [],
        recommendations: [
          "**یافتن معنا**: چه چیز برایتان مهم است؟",
          "**اهداف**: تعیین اهداف کوتاه‌مدت",
          "**تشخیص**: جستجوی تشخیص برای کارها",
          "**رشد**: فرصت‌های یادگیری",
          "**تغییر نقش**: درخواست وظایف جدید",
          "**تغییر شغل**: اگر واقعاً علاقه ندارید",
          "**مشاوره**: کمک برای یافتن مسیر"
        ]
      };
    } else if (score <= 70) {
      return {
        level: "انگیزه کاری متوسط",
        color: "#eab308",
        desc: "انگیزه کاری شما متوسط است.",
        details: "انگیزه کاری شما در حد متوسط است. می‌توانید با تقویت انگیزه درونی و ارتباط کار با ارزش‌هایتان، انگیزه خود را بهبود بخشید.",
        strengths: [],
        recommendations: [
          "**تقویت انگیزه درونی**: تمرکز بر لذت و معناداری کار",
          "**ارتباط کار با ارزش‌ها**: چگونه کار با ارزش‌هایتان هماهنگ است؟",
          "**چالش‌های جدید**: جستجوی پروژه‌های جدید",
          "**یادگیری مستمر**: توسعه مهارت‌های جدید"
        ]
      };
    } else {
      return {
        level: "انگیزه کاری بالا",
        color: "#22c55e",
        desc: "انگیزه کاری عالی - متعهد و مشتاق به کار هستید.",
        details: "انگیزه کاری شما عالی است. شما متعهد و مشتاق به کار خود هستید و کار برایتان معنادار است.",
        strengths: ["انگیزه بالا", "تعهد قوی", "رضایت از کار", "عملکرد خوب"],
        recommendations: [
          "**حفظ تعادل**: مراقب فرسودگی باشید",
          "**پیشگیری از فرسودگی**: استراحت کافی",
          "**استراحت کافی**: حفظ تعادل کار-زندگی",
          "**تنوع**: حفظ تنوع در وظایف"
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
    const interpretation = getInterpretation(scores.totalScore);
    const maxScore = 75;

    const chartData = {
      labels: ['نمره شما', 'پایین (15-40)', 'متوسط (41-70)', 'بالا (71-75)'],
      datasets: [{
        label: 'نمره انگیزه کاری',
        data: [scores.totalScore, 40, 70, 75],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(239, 68, 68, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(34, 197, 94, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)'
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
                <FaBriefcase className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست انگیزه کاری</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل انگیزه کاری</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{scores.totalScore}</div>
              <div className="text-sm text-secondaryTextColor mb-4">از 75</div>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor mt-2">{interpretation.details}</p>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">انگیزه درونی</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#22c55e" }}>{scores.intrinsic}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">انگیزه بیرونی</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#eab308" }}>{scores.extrinsic}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">خودمختار</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#3b82f6" }}>{scores.autonomous}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">کنترل شده</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#ef4444" }}>{scores.controlled}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار زیرمقیاس‌ها</h3>
              <div className="w-full h-80">
                <Bar data={{
                  labels: ['درونی', 'بیرونی', 'خودمختار', 'کنترل شده'],
                  datasets: [{
                    label: 'نمرات زیرمقیاس‌های انگیزه کاری',
                    data: [scores.intrinsic, scores.extrinsic, scores.autonomous, scores.controlled],
                    backgroundColor: [
                      '#22c55e',
                      '#eab308',
                      '#3b82f6',
                      '#ef4444'
                    ],
                    borderColor: [
                      '#16a34a',
                      '#ca8a04',
                      '#2563eb',
                      '#dc2626'
                    ],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'تحلیل زیرمقیاس‌های انگیزه کاری', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 20, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
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
              <FaBriefcase className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست انگیزه کاری</h1>
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
            >{questions[currentQuestion].text || questions[currentQuestion]}</h3>
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