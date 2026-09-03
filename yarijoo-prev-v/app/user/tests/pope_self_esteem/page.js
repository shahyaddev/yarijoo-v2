"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeart } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("pope_self_esteem");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "از خودم راضی هستم", domain: "global" },
    { text: "فکر می‌کنم فرد خوبی هستم", domain: "global" },
    { text: "در مدرسه خوب هستم", domain: "academic" },
    { text: "از نمرات خود راضی هستم", domain: "academic" },
    { text: "دوستان زیادی دارم", domain: "social" },
    { text: "به راحتی با مردم دوست می‌شوم", domain: "social" },
    { text: "خانواده‌ام دوستم دارد", domain: "family" },
    { text: "خانواده‌ام از من حمایت می‌کند", domain: "family" },
    { text: "ظاهر من خوب است", domain: "body" },
    { text: "از شکل بدنم راضی هستم", domain: "body" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "خیر" },
    { value: 1, label: "بله" }
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

  const calculateScores = () => {
    const domainScores = {
      global: 0,
      academic: 0,
      social: 0,
      family: 0,
      body: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      domainScores[q.domain] += answer;
    });

    const totalScore = Object.values(domainScores).reduce((sum, val) => sum + val, 0);
    return { ...domainScores, totalScore };
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
    const maxScore = 10;
    const percentage = (scores.totalScore / maxScore) * 100;

    if (percentage >= 70) {
      return {
        level: "عزت نفس بالا",
        color: "#22c55e",
        desc: "عزت نفس شما در سطح بالایی است.",
        details: "نمره شما نشان می‌دهد که عزت نفس بالایی در حوزه‌های مختلف زندگی دارید. شما از خودتان راضی هستید، توانایی‌های خود را می‌شناسید و احساس ارزشمندی می‌کنید. این یک نشانه مثبت از سلامت روان است.",
        strengths: [
          "عزت نفس بالا در حوزه‌های مختلف",
          "رضایت از خود",
          "اعتماد به نفس قوی",
          "عملکرد مناسب در مدرسه و زندگی",
          "روابط اجتماعی سالم",
          "حمایت خانواده"
        ],
        recommendations: [
          "حفظ و تقویت عزت نفس فعلی",
          "ادامه فعالیت‌هایی که به شما حس ارزشمندی می‌دهد",
          "کمک به دیگران برای بهبود عزت نفس خود",
          "حفظ تعادل بین اعتماد به نفس و تواضع"
        ]
      };
    } else if (percentage >= 40) {
      return {
        level: "عزت نفس متوسط",
        color: "#eab308",
        desc: "عزت نفس شما در سطح متوسط است.",
        details: "عزت نفس شما در حد متوسط است. شما در برخی حوزه‌ها احساس خوبی دارید اما در برخی دیگر نیاز به بهبود دارید. با کار بر روی تقویت خودارزشمندی می‌توانید عزت نفس خود را افزایش دهید.",
        strengths: [
          "برخی جنبه‌های مثبت عزت نفس",
          "آگاهی از نیاز به بهبود",
          "پتانسیل برای رشد"
        ],
        recommendations: [
          "شناسایی حوزه‌هایی که عزت نفس پایین‌تری دارند",
          "تمرکز بر نقاط قوت و توانایی‌ها",
          "تعیین اهداف کوچک و قابل دستیابی",
          "جشن‌گیری موفقیت‌ها، حتی کوچک",
          "یادگیری خودگفتاری مثبت",
          "اجتناب از مقایسه خود با دیگران",
          "مراقبت از خود و سلامت جسمی",
          "تقویت روابط اجتماعی مثبت"
        ]
      };
    } else {
      return {
        level: "عزت نفس پایین",
        color: "#ef4444",
        desc: "عزت نفس شما پایین است و نیاز به توجه دارد.",
        details: "نمره پایین شما نشان می‌دهد که عزت نفس شما در یک یا چند حوزه پایین است. شما ممکن است خود را کمتر ارزشمند بدانید و احساس ناکافی بودن کنید. این می‌تواند بر عملکرد تحصیلی، روابط و کیفیت زندگی تأثیر بگذارد. کار بر روی بهبود عزت نفس ضروری است.",
        strengths: [
          "آگاهی از مشکل",
          "تمایل به بهبود"
        ],
        recommendations: [
          "مشاوره با روان‌شناس مدرسه یا مشاور برای بهبود عزت نفس",
          "درمان شناختی-رفتاری (CBT) برای تغییر الگوهای فکری منفی",
          "شناسایی و چالش با افکار خودانتقادی",
          "تمرکز بر نقاط قوت و موفقیت‌های کوچک",
          "تعیین و دستیابی به اهداف کوچک برای ایجاد حس موفقیت",
          "یادگیری خودگفتاری مثبت و مهربانانه",
          "حذف یا کاهش ارتباط با افراد منفی",
          "مراقبت از خود و سلامت جسمی",
          "دریافت حمایت از خانواده و دوستان",
          "درمان بلندمدت برای تغییر الگوهای عمیق"
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
      labels: ["کلی", "تحصیلی", "اجتماعی", "خانواده", "جسمی"],
      datasets: [
        {
          label: "نمرات حوزه‌های عزت نفس",
          data: [
            scores.global,
            scores.academic,
            scores.social,
            scores.family,
            scores.body
          ],
          backgroundColor: [
            interpretation.color + "B3",
            interpretation.color + "B3",
            interpretation.color + "B3",
            interpretation.color + "B3",
            interpretation.color + "B3"
          ],
          borderColor: [
            interpretation.color,
            interpretation.color,
            interpretation.color,
            interpretation.color,
            interpretation.color
          ],
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
          text: "عزت نفس در حوزه‌های مختلف",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 2,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 10 } },
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
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست عزت نفس</h1>
                <p className="text-secondaryTextColor">Pope Self-Esteem Scale</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {scores.totalScore} از 10
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
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست عزت نفس</h1>
              <p className="text-secondaryTextColor">Pope Self-Esteem Scale</p>
              <p className="text-secondaryTextColor text-sm mt-1">سوال {currentQuestion + 1} از {questions.length}</p>
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