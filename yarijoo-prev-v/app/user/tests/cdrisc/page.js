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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("cdrisc");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "در مواجهه با سختی‌ها، می‌توانم خود را وفق دهم.",
  "در شرایط فشار، آرامش نسبی خود را حفظ می‌کنم.",
  "وقتی چیزها بد پیش می‌رود، راه‌حل‌های جایگزین پیدا می‌کنم.",
  "پس از شکست، سریع‌تر از گذشته به مسیر برمی‌گردم.",
  "در بحران‌ها می‌توانم تصمیم‌های مؤثر بگیرم.",
  "در برابر مشکلات، احساس توانمندی می‌کنم.",
  "وقتی دلسرد می‌شوم، انگیزه را دوباره به‌دست می‌آورم.",
  "در شرایط پیش‌بینی‌ناپذیر، انعطاف‌پذیر عمل می‌کنم.",
  "حتی در دشواری‌ها، به آینده امیدوار می‌مانم.",
  "با تکیه بر نقاط قوتم، از پس چالش‌ها برمی‌آیم."
        ]

  const options = [
  {
    "value": 1,
    "label": "اصلاً"
  },
  {
    "value": 2,
    "label": "کم"
  },
  {
    "value": 3,
    "label": "تاحدی"
  },
  {
    "value": 4,
    "label": "زیاد"
  },
  {
    "value": 5,
    "label": "بسیار زیاد"
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
    const maxScore = 40;
    
    if (score < 25) {
      return {
        level: "پایین",
        color: "#eab308",
        desc: "تاب‌آوری پایین که نیاز به تقویت دارد.",
        details: "نمره شما نشان می‌دهد که تاب‌آوری پایین است و نیاز به تقویت دارد. در مواجهه با چالش‌ها و استرس، ممکن است دشواری بیشتری تجربه کنید.",
        strengths: [
          "پتانسیل برای بهبود",
          "آگاهی از نیاز به تقویت"
        ],
        recommendations: [
          "یادگیری مهارت‌های مقابله‌ای",
          "تقویت حمایت اجتماعی",
          "مدیریت استرس و اضطراب",
          "مشاوره با روان‌شناس",
          "برنامه تقویت تاب‌آوری"
        ]
      };
    }
    if (score < 32) {
      return {
        level: "متوسط",
        color: "#22c55e",
        desc: "تاب‌آوری در محدوده متوسط است.",
        details: "تاب‌آوری شما در محدوده متوسط است و قابل بهبود است. شما توانایی نسبی در مواجهه با چالش‌ها دارید.",
        strengths: [
          "برخی مهارت‌های مقابله",
          "توانایی نسبی در سازگاری",
          "پتانسیل بهبود"
        ],
        recommendations: [
          "توسعه مهارت‌های مقابله‌ای",
          "افزایش فعالیت‌های لذت‌بخش",
          "تقویت روابط اجتماعی",
          "تمرین ذهن‌آگاهی"
        ]
      };
    }
    return {
      level: "بالا",
      color: "#16a34a",
      desc: "تاب‌آوری بالا که نشانه مثبت است.",
      details: "نمره شما نشان می‌دهد که تاب‌آوری بالایی دارید. شما به خوبی با چالش‌ها مقابله می‌کنید و از استرس بهبود می‌یابید.",
      strengths: [
        "مقابله مؤثر با چالش‌ها",
        "بازیابی سریع از استرس",
        "انعطاف‌پذیری و سازگاری",
        "مهارت‌های مقابله قوی",
        "نگرش مثبت"
      ],
      recommendations: [
        "حفظ مهارت‌های مقابله‌ای فعلی",
        "ادامه فعالیت‌های لذت‌بخش",
        "کمک به دیگران",
        "توسعه مداوم مهارت‌ها"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score < 25) {
      return [
        "یادگیری مهارت‌های مقابله‌ای",
        "تقویت حمایت اجتماعی",
        "مدیریت استرس و اضطراب",
        "مشاوره با روان‌شناس",
        "برنامه تقویت تاب‌آوری"
      ];
    }
    if (score < 32) {
      return [
        "توسعه مهارت‌های مقابله‌ای",
        "افزایش فعالیت‌های لذت‌بخش",
        "تقویت روابط اجتماعی",
        "تمرین ذهن‌آگاهی"
      ];
    }
    return [
      "حفظ مهارت‌های مقابله‌ای فعلی",
      "ادامه فعالیت‌های لذت‌بخش",
      "کمک به دیگران",
      "توسعه مداوم مهارت‌ها"
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست CDRISC</h1>
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
                <div className="text-sm text-secondaryTextColor">از 40</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={{
                  labels: ['نمره شما', 'آستانه متوسط (25)', 'آستانه بالا (32)'],
                  datasets: [{
                    label: 'نمره تاب‌آوری',
                    data: [score, 25, 32],
                    backgroundColor: [interpretation.color + 'B3', 'rgba(234, 179, 8, 0.3)', 'rgba(34, 197, 94, 0.3)'],
                    borderColor: [interpretation.color, 'rgb(234, 179, 8)', 'rgb(34, 197, 94)'],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره تاب‌آوری و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره CD-RISC</h4>
              <p className="text-sm text-blue-300">CD-RISC یک ابزار 10 سوالی برای سنجش تاب‌آوری است. نمره بالاتر نشان‌دهنده تاب‌آوری بیشتر است.</p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست CDRISC</h1>
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
