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

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("attachment_style");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedScore, setSavedScore] = useState(null);

  const questions = [
    "نزدیک شدن به دیگران برایم آسان است",
    "به دیگران اعتماد دارم",
    "در روابط احساس راحتی می‌کنم",
    "نگران دور شدن عزیزانم هستم",
    "می‌ترسم که مرا دوست نداشته باشند",
    "نیاز به تایید مداوم دارم",
    "نگران رها شدن هستم",
    "ترجیح می‌دهم به دیگران وابسته نباشم",
    "نزدیکی زیاد مرا ناراحت می‌کند",
    "سخت است که کاملاً به کسی اعتماد کنم",
    "ترجیح می‌دهم استقلال داشته باشم",
    "احساس امنیت در روابط می‌کنم",
    "می‌توانم روی دیگران حساب کنم",
    "ترس از طرد شدن دارم",
    "نگران بی‌تفاوت شدن طرف مقابل هستم",
    "از صمیمیت زیاد اجتناب می‌کنم",
    "احساسات خود را به راحتی ابراز نمی‌کنم",
    "در روابط احساس آرامش می‌کنم"
  ];

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
      "label": "کمی مخالفم"
    },
    {
      "value": 4,
      "label": "نه موافق نه مخالف"
    },
    {
      "value": 5,
      "label": "کمی موافقم"
    },
    {
      "value": 6,
      "label": "موافقم"
    },
    {
      "value": 7,
      "label": "کاملاً موافقم"
    }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
      if (previousResult.total_score !== undefined || previousResult.totalScore !== undefined) {
        setSavedScore(previousResult.total_score || previousResult.totalScore);
      }
    } else if (!hasResult && !resultLoading) {
      setIsCompleted(false);
    }
  }, [hasResult, previousResult, resultLoading]);

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        const score = calculateScore();
        const interpretation = getInterpretation(score);
        
        try {
          const answersArray = questions.map((q, idx) => answers[idx] || 0);

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

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
  };

  const getInterpretation = (score) => {
    const maxScore = 126; // 18 questions * 7
    const percentage = (score / maxScore) * 100;
    
    if (percentage < 30) {
      return {
        level: "دلبستگی ایمن",
        color: "#22c55e",
        desc: "شما سبک دلبستگی ایمن دارید. در روابط احساس امنیت می‌کنید.",
        details: "سبک دلبستگی ایمن شما نشان می‌دهد که در روابط احساس امنیت و راحتی می‌کنید. شما می‌توانید به دیگران اعتماد کنید و در عین حال استقلال خود را حفظ کنید.",
        strengths: [
          "توانایی برقراری روابط صمیمانه",
          "اعتماد به دیگران",
          "احساس امنیت در روابط",
          "تعادل بین وابستگی و استقلال"
        ],
        recommendations: [
          "حفظ این سبک دلبستگی سالم",
          "توسعه روابط عمیق‌تر",
          "کمک به دیگران در ایجاد روابط سالم"
        ]
      };
    } else if (percentage < 60) {
      return {
        level: "دلبستگی مضطرب",
        color: "#eab308",
        desc: "شما سبک دلبستگی مضطرب دارید. نگرانی از رها شدن دارید.",
        details: "سبک دلبستگی مضطرب شما نشان می‌دهد که در روابط نگران رها شدن و طرد شدن هستید. این می‌تواند باعث وابستگی بیش از حد شود.",
        strengths: [],
        recommendations: [
          "کار روی افزایش اعتماد به نفس",
          "درمان یا مشاوره برای کاهش اضطراب در روابط",
          "یادگیری مهارت‌های ارتباطی",
          "کار روی استقلال فردی"
        ]
      };
    } else {
      return {
        level: "دلبستگی اجتنابی",
        color: "#f97316",
        desc: "شما سبک دلبستگی اجتنابی دارید. از صمیمیت زیاد اجتناب می‌کنید.",
        details: "سبک دلبستگی اجتنابی شما نشان می‌دهد که از صمیمیت زیاد در روابط اجتناب می‌کنید. شما ترجیح می‌دهید استقلال داشته باشید اما ممکن است در ایجاد روابط عمیق مشکل داشته باشید.",
        strengths: [],
        recommendations: [
          "کار روی باز کردن خود به دیگران",
          "درمان یا مشاوره برای کاهش ترس از صمیمیت",
          "تمرین اعتماد کردن به دیگران",
          "درک مزایای روابط صمیمانه"
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
    const score = savedScore !== null ? savedScore : calculateScore();
    const interpretation = getInterpretation(score);
    const maxScore = 126;

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
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک دلبستگی</h1>
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
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک دلبستگی</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            {interpretation.details && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">جزئیات تحلیل</h3>
                <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
              </div>
            )}

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {interpretation.recommendations && interpretation.recommendations.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
                <ul className="space-y-3">
                  {interpretation.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primaryThemeColor mt-1">•</span>
                      <span className="text-secondaryTextColor">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <button 
              onClick={async () => { 
                await resetResult();
                setCurrentQuestion(0); 
                setAnswers({}); 
                setIsCompleted(false);
                setSavedScore(null);
              }} 
              className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors"
            >
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
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست سبک دلبستگی</h1>
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

export default TestPage;
