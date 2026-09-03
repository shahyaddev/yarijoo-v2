"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("schizophrenia_risk");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "صداهایی شنیدم که دیگران نمی‌شنیدند", symptom: "hallucination" },
    { text: "چیزهایی دیدم که دیگران نمی‌دیدند", symptom: "hallucination" },
    { text: "باور داشتم افکارم توسط دیگران کنترل می‌شود", symptom: "delusion" },
    { text: "فکر می‌کردم دیگران می‌خواهند به من آسیب برسانند", symptom: "delusion" },
    { text: "افکارم آشفته و غیرمنطقی بود", symptom: "thought_disorder" },
    { text: "صحبت کردن برایم دشوار بود", symptom: "speech" },
    { text: "احساس بی‌حسی و بی‌علاقگی می‌کردم", symptom: "negative" },
    { text: "انگیزه‌ای برای انجام کار نداشتم", symptom: "negative" },
    { text: "از فعالیت‌های اجتماعی اجتناب می‌کردم", symptom: "social" },
    { text: "نمی‌توانستم احساساتم را ابراز کنم", symptom: "negative" }
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
    const symptoms = {
      hallucination: 0,
      delusion: 0,
      thought_disorder: 0,
      speech: 0,
      negative: 0,
      social: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (symptoms[q.symptom] !== undefined) {
        symptoms[q.symptom] += answer;
      }
    });

    const totalScore = Object.values(symptoms).reduce((sum, val) => sum + val, 0);

    return { ...symptoms, totalScore };
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
    const { totalScore } = scores;
    
    if (totalScore === 0) {
      return {
        level: "خطر پایین",
        color: "#22c55e",
        desc: "هیچ علامتی از خطر اسکیزوفرنی گزارش نشده است.",
        details: "پاسخ‌های شما نشان می‌دهد که در شش ماه گذشته علائمی که با خطر اسکیزوفرنی مرتبط است را تجربه نکرده‌اید. این یک نشانه مثبت است.",
        strengths: [
          "عدم وجود علائم روان‌پریشی",
          "عملکرد مناسب",
          "سلامت روانی خوب"
        ],
        recommendations: [
          "حفظ سبک زندگی سالم",
          "پایش منظم سلامت روانی",
          "در صورت بروز علائم جدید، مراجعه به متخصص"
        ]
      };
    } else if (totalScore <= 2) {
      return {
        level: "خطر خفیف",
        color: "#eab308",
        desc: "برخی علائم خفیف وجود دارد که نیاز به توجه دارد.",
        details: "شما برخی علائم خفیف را گزارش کرده‌اید که ممکن است طبیعی باشد یا نیاز به بررسی بیشتر دارد. بهتر است با متخصص سلامت روان مشورت کنید.",
        strengths: [
          "آگاهی از علائم",
          "جستجوی کمک"
        ],
        recommendations: [
          "مشاوره با روان‌شناس یا روان‌پزشک برای ارزیابی",
          "پایش منظم علائم",
          "در صورت تشدید علائم، مراجعه فوری",
          "حفظ سبک زندگی سالم و مدیریت استرس"
        ]
      };
    } else {
      return {
        level: "خطر متوسط تا بالا",
        color: "#ef4444",
        desc: "چندین علائم وجود دارد که نیاز به ارزیابی فوری دارد.",
        details: "شما چندین علائم را گزارش کرده‌اید که ممکن است نشان‌دهنده خطر اسکیزوفرنی باشد. این علائم نیاز به ارزیابی فوری توسط متخصص سلامت روان دارد. تشخیص زودهنگام و درمان می‌تواند به طور قابل توجهی نتایج را بهبود بخشد.",
        strengths: [
          "شناسایی علائم",
          "جستجوی کمک"
        ],
        recommendations: [
          "🚨 مراجعه فوری به روان‌پزشک برای ارزیابی تخصصی",
          "ارزیابی جامع و تشخیص دقیق",
          "درمان زودهنگام در صورت نیاز",
          "درمان ترکیبی (دارو + روان‌درمانی) در صورت تشخیص",
          "حمایت خانواده و دوستان",
          "پایش منظم و پیگیری دقیق",
          "در صورت وجود افکار خودکشی یا آسیب به خود، تماس فوری با اورژانس"
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
    const maxScore = 10;

    const chartData = {
      labels: ["توهم", "هذیان", "اختلال تفکر", "مشکل گفتار", "علائم منفی", "مشکل اجتماعی", "نمره کل"],
      datasets: [
        {
          label: "نمرات",
          data: [
            scores.hallucination,
            scores.delusion,
            scores.thought_disorder,
            scores.speech,
            scores.negative,
            scores.social,
            scores.totalScore
          ],
          backgroundColor: [
            "rgba(239, 68, 68, 0.5)",
            "rgba(249, 115, 22, 0.5)",
            "rgba(234, 179, 8, 0.5)",
            "rgba(168, 85, 247, 0.5)",
            "rgba(59, 130, 246, 0.5)",
            "rgba(34, 197, 94, 0.5)",
            interpretation.color + "B3"
          ],
          borderColor: [
            "rgb(239, 68, 68)",
            "rgb(249, 115, 22)",
            "rgb(234, 179, 8)",
            "rgb(168, 85, 247)",
            "rgb(59, 130, 246)",
            "rgb(34, 197, 94)",
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
          text: "ارزیابی خطر اسکیزوفرنی",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxScore,
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج ارزیابی خطر اسکیزوفرنی</h1>
                <p className="text-secondaryTextColor">Schizophrenia Risk Assessment</p>
              </div>
            </div>

            {scores.totalScore >= 3 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار</h4>
                <p className="text-sm text-red-300">چندین علائم گزارش شده است. ارزیابی تخصصی فوری توصیه می‌شود.</p>
              </div>
            )}

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {scores.totalScore} از {maxScore}
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار علائم</h3>
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
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">ارزیابی خطر اسکیزوفرنی</h1>
              <p className="text-secondaryTextColor">در شش ماه گذشته:</p>
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