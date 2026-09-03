"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserMd } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("pai");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "بیشتر اوقات شاد هستم", reverse: true, scale: "depression" },
    { text: "اغلب نگران هستم", reverse: false, scale: "anxiety" },
    { text: "تجربیات غیرعادی داشته‌ام", reverse: false, scale: "schizophrenia" },
    { text: "گاهی پرخاشگر می‌شوم", reverse: false, scale: "aggression" },
    { text: "درد جسمی دارم", reverse: false, scale: "somatic" },
    { text: "مشکل الکل دارم", reverse: false, scale: "alcohol" },
    { text: "احساس می‌کنم دیگران علیه‌ام هستند", reverse: false, scale: "paranoia" },
    { text: "خلق من تغییر می‌کند", reverse: false, scale: "mania" },
    { text: "رابطه‌هایم مشکل دارد", reverse: false, scale: "borderline" },
    { text: "قوانین را نقض می‌کنم", reverse: false, scale: "antisocial" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "نادرست" },
    { value: 1, label: "درست" }
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
    const scaleScores = {
      depression: 0,
      anxiety: 0,
      schizophrenia: 0,
      aggression: 0,
      somatic: 0,
      alcohol: 0,
      paranoia: 0,
      mania: 0,
      borderline: 0,
      antisocial: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      const score = q.reverse ? (1 - answer) : answer;

      scaleScores[q.scale] += score;
    });

    const totalScore = Object.values(scaleScores).reduce((sum, val) => sum + val, 0);
    const maxScale = Object.keys(scaleScores).reduce((a, b) => scaleScores[a] > scaleScores[b] ? a : b);
    
    return { ...scaleScores, totalScore, maxScale };
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
    const scaleNames = {
      depression: "افسردگی",
      anxiety: "اضطراب",
      schizophrenia: "اسکیزوفرنی",
      aggression: "پرخاشگری",
      somatic: "جسمانی",
      alcohol: "الکل",
      paranoia: "پارانویا",
      mania: "مانیا",
      borderline: "مرزی",
      antisocial: "ضداجتماعی"
    };

    if (scores.totalScore <= 2) {
      return {
        level: "سطح پایین",
        color: "#22c55e",
        desc: "نمرات شما در همه مقیاس‌ها در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که شما در وضعیت روانی خوبی هستید و علائم بالینی قابل توجهی وجود ندارد. این یک نشانه مثبت از سلامت روان است.",
        strengths: ["سلامت روانی خوب", "عدم علائم بالینی", "عملکرد مناسب"],
        recommendations: ["حفظ سبک زندگی سالم", "مدیریت استرس", "در صورت نیاز، مشاوره منظم"]
      };
    } else if (scores.totalScore <= 5) {
      return {
        level: "سطح متوسط",
        color: "#eab308",
        desc: "برخی علائم خفیف وجود دارد که نیاز به توجه دارد.",
        details: `نمره شما نشان می‌دهد که در مقیاس ${scaleNames[scores.maxScale]} علائمی وجود دارد. این ممکن است نیاز به بررسی بیشتر داشته باشد.`,
        strengths: ["آگاهی از علائم", "پتانسیل برای بهبود"],
        recommendations: [
          "مشاوره با روان‌شناس برای ارزیابی دقیق‌تر",
          "یادگیری تکنیک‌های مدیریت استرس",
          "مراقبت از خود و سلامت جسمی",
          "در صورت ادامه علائم، درمان تخصصی"
        ]
      };
    } else {
      return {
        level: "سطح بالا - نیاز به توجه",
        color: "#ef4444",
        desc: "علائم قابل توجهی وجود دارد که نیاز به ارزیابی و درمان تخصصی دارد.",
        details: `نمره بالای شما نشان می‌دهد که در مقیاس ${scaleNames[scores.maxScale]} علائم قابل توجهی وجود دارد. این نیازمند ارزیابی و مداخله تخصصی است.`,
        strengths: ["شناسایی مشکل", "تمایل به بهبود"],
        recommendations: [
          "مراجعه فوری به روان‌پزشک یا روان‌شناس برای ارزیابی کامل",
          "درمان تخصصی بر اساس تشخیص",
          "ایجاد سیستم حمایتی قوی",
          "پایش منظم وضعیت سلامت روان",
          "در صورت نیاز، دارودرمانی و روان‌درمانی"
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
      labels: ["افسردگی", "اضطراب", "اسکیزوفرنی", "پرخاشگری", "جسمانی", "الکل", "پارانویا", "مانیا", "مرزی", "ضداجتماعی"],
      datasets: [
        {
          label: "نمرات مقیاس‌ها",
          data: [
            scores.depression,
            scores.anxiety,
            scores.schizophrenia,
            scores.aggression,
            scores.somatic,
            scores.alcohol,
            scores.paranoia,
            scores.mania,
            scores.borderline,
            scores.antisocial
          ],
          backgroundColor: interpretation.color + "B3",
          borderColor: interpretation.color,
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
          text: "نمرات مقیاس‌های PAI",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 8 } },
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
                <FaUserMd className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست ارزیابی شخصیت</h1>
                <p className="text-secondaryTextColor">Personality Assessment Inventory (PAI) - Short Form</p>
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
              <FaUserMd className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست ارزیابی شخصیت (PAI)</h1>
              <p className="text-secondaryTextColor">Personality Assessment Inventory - Short Form</p>
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