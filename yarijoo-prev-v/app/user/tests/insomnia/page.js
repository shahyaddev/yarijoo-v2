"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaMoon } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { useTestResult } from "@/hooks/useTestResult";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("insomnia");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "سختی به خواب رفتن",
    "بیدار شدن در طول شب",
    "بیدار شدن زودتر از موقع",
    "رضایت از الگوی خواب فعلی",
    "دیگران متوجه مشکل خواب شما می‌شوند",
    "نگرانی از مشکل خواب",
    "مشکل خواب زندگی روزانه را مختل می‌کند"
  ], []);

  const options = useMemo(() => [
    { value: 0, label: "هیچ" },
    { value: 1, label: "خفیف" },
    { value: 2, label: "متوسط" },
    { value: 3, label: "شدید" },
    { value: 4, label: "بسیار شدید" }
  ], []);

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
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
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
    if (score <= 7) {
      return {
        level: "بدون بی‌خوابی",
        color: "#22c55e",
        desc: "شما مشکل بی‌خوابی بالینی ندارید. خواب شما در وضعیت نرمالی است.",
        details: "کیفیت خواب شما مناسب است و مشکلات خواب به طور قابل توجهی زندگی شما را مختل نمی‌کند.",
        strengths: [
          "کیفیت خواب مناسب",
          "عدم اختلال خواب",
          "انرژی روزانه کافی"
        ],
        recommendations: [
          "حفظ بهداشت خواب فعلی",
          "خواب منظم",
          "محیط مناسب خواب",
          "اجتناب از محرک‌ها قبل خواب"
        ]
      };
    } else if (score <= 14) {
      return {
        level: "بی‌خوابی خفیف",
        color: "#eab308",
        desc: "علائم خفیف بی‌خوابی دارید که با بهبود بهداشت خواب قابل کنترل است.",
        details: "مشکلات خواب شما در سطح خفیفی است که معمولاً با تغییرات سبک زندگی بهبود می‌یابد.",
        strengths: [
          "مشکل در مرحله اولیه",
          "قابل کنترل با روش‌های ساده"
        ],
        recommendations: [
          "رعایت بهداشت خواب",
          "برنامه خواب منظم",
          "محدود کردن کافئین",
          "ورزش روزانه",
          "تکنیک‌های آرام‌سازی قبل خواب"
        ]
      };
    } else if (score <= 21) {
      return {
        level: "بی‌خوابی متوسط",
        color: "#f59e0b",
        desc: "بی‌خوابی متوسط دارید که شروع به تأثیر بر عملکرد روزانه کرده است.",
        details: "مشکلات خواب شما نیاز به مداخله حرفه‌ای دارد. CBT-I (درمان شناختی-رفتاری بی‌خوابی) می‌تواند بسیار مؤثر باشد.",
        strengths: [
          "شناخت مشکل",
          "امکان بهبود با درمان"
        ],
        recommendations: [
          "مشاوره با متخصص خواب",
          "CBT-I (بهترین درمان)",
          "بررسی علل پزشکی",
          "بهداشت خواب دقیق",
          "اجتناب از خواب روزانه"
        ]
      };
    } else {
      return {
        level: "بی‌خوابی شدید",
        color: "#dc2626",
        desc: "بی‌خوابی شدید دارید که به شدت عملکرد شما را مختل می‌کند.",
        details: "نیاز فوری به ارزیابی و درمان توسط متخصص خواب یا روان‌پزشک دارید.",
        strengths: [
          "شناخت نیاز فوری به کمک"
        ],
        recommendations: [
          "مراجعه فوری به متخصص خواب",
          "بررسی کامل پزشکی",
          "احتمال نیاز به دارو موقت",
          "CBT-I تخصصی",
          "بررسی اختلالات همزمان",
          "پیگیری دقیق درمان"
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

    const chartData = {
      labels: ["نمره شما", "آستانه خفیف", "آستانه متوسط", "حداکثر"],
      datasets: [
        {
          label: "بی‌خوابی",
          data: [score, 8, 15, 28],
          backgroundColor: ["#3b82f6", "#eab308", "#f59e0b", "#dc2626"],
          borderColor: ["#2563eb", "#ca8a04", "#d97706", "#b91c1c"],
          borderWidth: 2
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "شاخص شدت بی‌خوابی (ISI)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 28,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        }
      }
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
                <FaMoon className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج شاخص شدت بی‌خوابی</h1>
                <p className="text-secondaryTextColor">Insomnia Severity Index (ISI)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 28
              </div>
              <div className="text-lg font-semibold" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
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
      <Header />
      <MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaMoon className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">شاخص شدت بی‌خوابی (ISI)</h1>
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
            >
              {questions[currentQuestion]}
            </h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
              <div
                className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;



