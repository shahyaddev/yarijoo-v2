"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ybocs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "مدت زمانی که افکار وسواسی در روز اشغال می‌کنند.",
  "میزان تداخل افکار وسواسی در کارکرد روزمره.",
  "شدت ناراحتی ناشی از افکار وسواسی.",
  "میزان مقاومت در برابر افکار وسواسی.",
  "کنترل بر افکار وسواسی.",
  "مدت زمانی که اعمال اجباری صرف می‌کنند.",
  "میزان تداخل اعمال اجباری در کارکرد روزمره.",
  "شدت ناراحتی هنگام انجام ندادن اعمال اجباری.",
  "میزان مقاومت در برابر اعمال اجباری.",
  "کنترل بر اعمال اجباری."
        ]

  const options = [
  {
    "value": 0,
    "label": "هیچ"
  },
  {
    "value": 1,
    "label": "خفیف"
  },
  {
    "value": 2,
    "label": "متوسط"
  },
  {
    "value": 3,
    "label": "شدید"
  },
  {
    "value": 4,
    "label": "بسیار شدید"
  }
        ]

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const obsessions = [0, 1, 2, 3, 4].reduce((sum, idx) => sum + (answers[idx] || 0), 0);
    const compulsions = [5, 6, 7, 8, 9].reduce((sum, idx) => sum + (answers[idx] || 0), 0);
    const total = obsessions + compulsions;
    return { obsessions, compulsions, total };
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
    if (score <= 7) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "علائم OCD در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که علائم وسواس فکری-عملی در حد طبیعی است. شما از سلامت روانی خوبی برخوردار هستید و علائم قابل توجهی مشاهده نمی‌شود.",
        strengths: [
          "عدم علائم قابل توجه OCD",
          "سلامت روانی خوب",
          "عملکرد مناسب",
          "کیفیت زندگی مناسب"
        ],
        recommendations: [
          "حفظ سبک زندگی سالم",
          "پایش علائم در دوره‌های پراسترس",
          "در صورت نیاز، مشاوره با روان‌شناس"
        ]
      };
    }
    if (score <= 15) {
      return {
        level: "خفیف",
        color: "#84cc16",
        desc: "علائم خفیف OCD که نیاز به توجه دارد.",
        details: "علائم خفیف وسواس فکری-عملی در شما مشاهده می‌شود. این علائم معمولاً قابل کنترل هستند و با یادگیری مهارت‌های مدیریت می‌توانید آنها را بهبود دهید.",
        strengths: [
          "آگاهی از علائم",
          "پتانسیل برای بهبود"
        ],
        recommendations: [
          "یادگیری تکنیک‌های مدیریت استرس",
          "توجه به علائم هشداردهنده",
          "مشاوره اولیه با روان‌شناس"
        ]
      };
    }
    if (score <= 25) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "علائم متوسط OCD که نیاز به ارزیابی دارد.",
        details: "علائم متوسط وسواس فکری-عملی در شما مشاهده می‌شود که نیاز به توجه دارد. این علائم ممکن است بر عملکرد روزانه شما تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی",
          "درمان شناختی-رفتاری (CBT) برای OCD",
          "یادگیری تکنیک‌های مدیریت افکار وسواسی",
          "بازسازی شناختی"
        ]
      };
    }
    if (score <= 32) {
      return {
        level: "شدید",
        color: "#f97316",
        desc: "علائم شدید OCD که نیاز به مداخله دارد.",
        details: "علائم شدید وسواس فکری-عملی در شما مشاهده می‌شود که نیاز به مداخله تخصصی دارد. این علائم می‌توانند به شدت بر زندگی روزمره شما تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "مراجعه فوری به روان‌پزشک برای ارزیابی و درمان",
          "درمان تخصصی OCD شامل ERP (Exposure and Response Prevention)",
          "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
          "برنامه مواجهه تدریجی برای کاهش اعمال اجباری"
        ]
      };
    }
    return {
      level: "بسیار شدید",
      color: "#ef4444",
      desc: "علائم بسیار شدید OCD که نیاز به مراقبت فوری دارد.",
      details: "علائم بسیار شدید وسواس فکری-عملی در شما مشاهده می‌شود که نیاز به مداخله فوری تخصصی دارد. این وضعیت می‌تواند به شدت بر تمام جنبه‌های زندگی شما تأثیر بگذارد.",
      strengths: [
        "شناسایی مشکل",
        "شجاعت در جستجوی کمک"
      ],
      recommendations: [
        "مراجعه فوری و اورژانسی به روان‌پزشک",
        "درمان تخصصی فشرده OCD شامل ERP",
        "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
        "نظارت مداوم و پیگیری منظم",
        "حمایت کامل خانواده"
      ]
    };
  };

  const getRecommendations = (score, obsessions, compulsions) => {
    const recommendations = [];
    const hasSevere = score > 25;

    if (hasSevere) {
      recommendations.push("مراجعه فوری به روان‌پزشک برای ارزیابی و درمان");
      recommendations.push("درمان تخصصی OCD شامل ERP (Exposure and Response Prevention)");
      recommendations.push("برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی");
    } else if (score > 15) {
      recommendations.push("مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی");
      recommendations.push("درمان شناختی-رفتاری (CBT) برای OCD");
      recommendations.push("یادگیری تکنیک‌های مدیریت افکار وسواسی");
    } else {
      recommendations.push("یادگیری تکنیک‌های مدیریت استرس");
      recommendations.push("توجه به علائم هشداردهنده");
    }

    if (obsessions > 10) {
      recommendations.push("تمرین تکنیک‌های مدیریت افکار وسواسی");
      recommendations.push("بازسازی شناختی");
    }
    if (compulsions > 10) {
      recommendations.push("برنامه مواجهه تدریجی برای کاهش اعمال اجباری");
      recommendations.push("مقاومت در برابر انجام اعمال اجباری");
    }

    return recommendations;
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
    const { obsessions, compulsions, total } = calculateScores();
    const totalInterpretation = getInterpretation(total);
    const maxScore = 40;

    const chartData = {
      labels: ['افکار وسواسی', 'اعمال اجباری', 'نمره کل'],
      datasets: [{
        label: 'نمرات Y-BOCS',
        data: [obsessions, compulsions, total],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(147, 51, 234, 0.7)',
          totalInterpretation.color + 'B3'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          totalInterpretation.color
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست YBOCS</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">افکار وسواسی</h3>
                <div className="text-3xl font-bold mb-2 text-blue-500">{obsessions}</div>
                <div className="text-sm text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اعمال اجباری</h3>
                <div className="text-3xl font-bold mb-2 text-purple-500">{compulsions}</div>
                <div className="text-sm text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: totalInterpretation.color }}>{total}</div>
                <div className="text-sm text-secondaryTextColor">از 40</div>
                <div className="text-xs mt-1" style={{ color: totalInterpretation.color }}>{totalInterpretation.level}</div>
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
                    title: { display: true, text: 'تحلیل نمرات Y-BOCS', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {total > 15 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">نمره شما نشان‌دهنده علائم OCD است. ارزیابی تخصصی توصیه می‌شود.</p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{totalInterpretation.details}</p>
            </div>

            {totalInterpretation.strengths && totalInterpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {totalInterpretation.strengths.map((strength, index) => (
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
                {totalInterpretation.recommendations.map((rec, index) => (
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
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-secondaryTextColor">0-7: کمینه (طبیعی)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                  <span className="text-secondaryTextColor">8-15: خفیف</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">16-25: متوسط</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-secondaryTextColor">26-32: شدید</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">33-40: بسیار شدید</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره Y-BOCS</h4>
              <p className="text-sm text-blue-300">
                Y-BOCS یک مقیاس استاندارد 10 سوالی برای ارزیابی شدت علائم وسواس فکری-عملی است. 
                این تست شامل دو زیرمقیاس افکار وسواسی (5 سوال) و اعمال اجباری (5 سوال) است.
                نمره کل از 0 تا 40 متغیر است.
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
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست YBOCS</h1>
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
            >{questions[currentQuestion]}</h3>
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