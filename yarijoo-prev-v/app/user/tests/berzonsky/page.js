"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("berzonsky");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "فعالانه به دنبال اطلاعات درباره خودم می‌گردم", style: "informational" },
    { text: "قبل از تصمیم، نظرات مختلف را بررسی می‌کنم", style: "informational" },
    { text: "ارزش‌ها و باورهای خانواده را می‌پذیرم", style: "normative" },
    { text: "آنچه دیگران انتظار دارند را انجام می‌دهم", style: "normative" },
    { text: "از فکر کردن به خودم اجتناب می‌کنم", style: "diffuse" },
    { text: "تصمیمات را به تعویق می‌اندازم", style: "diffuse" },
    { text: "سوال می‌پرسم تا خودم را بشناسم", style: "informational" },
    { text: "به سنت‌ها پایبندم", style: "normative" },
    { text: "وقتی مجبورم، تصمیم می‌گیرم", style: "diffuse" },
    { text: "خود را کشف می‌کنم", style: "informational" },
    { text: "از قوانین پیروی می‌کنم", style: "normative" },
    { text: "به مسائل هویتی فکر نمی‌کنم", style: "diffuse" }
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
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const scores = { informational: 0, normative: 0, diffuse: 0 };
    questions.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.style === "informational") {
        scores.informational += answer;
      } else if (q.style === "normative") {
        scores.normative += answer;
      } else if (q.style === "diffuse") {
        scores.diffuse += answer;
      }
    });
    return scores;
  };

  const getDominantStyle = (scores) => {
    const maxScore = Math.max(scores.informational, scores.normative, scores.diffuse);
    if (maxScore === scores.informational) return "informational";
    if (maxScore === scores.normative) return "normative";
    return "diffuse";
  };

  const getStyleInfo = (style) => {
    const styles = {
      informational: {
        name: "سبک اطلاعاتی",
        color: "#22c55e",
        desc: "شما از سبک اطلاعاتی استفاده می‌کنید که سالم‌ترین رویکرد برای شکل‌گیری هویت است.",
        details: "شما به دنبال اطلاعات فعالانه‌اید، گزینه‌ها را بررسی می‌کنید و تصمیمات آگاهانه می‌گیرید. این به هویت دستیابی‌یافته و پخته منجر می‌شود.",
        strengths: [
          "جستجوی فعال اطلاعات",
          "بررسی عمیق خود",
          "تصمیم‌گیری آگاهانه",
          "انعطاف در برابر اطلاعات جدید",
          "خودشناسی عمیق"
        ],
        recommendations: [
          "ادامه کشف و رشد",
          "تأمل منظم درباره ارزش‌ها",
          "پذیرش تغییرات طبیعی",
          "کمک به دیگران در شکل‌گیری هویت"
        ]
      },
      normative: {
        name: "سبک هنجاری",
        color: "#eab308",
        desc: "شما انتظارات دیگران را بدون بررسی عمیق می‌پذیرید.",
        details: "این سبک ممکن است به هویت ناسازگار با خود واقعی منجر شود و احتمال بحران هویت در آینده وجود دارد.",
        strengths: [
          "پایبندی به سنت‌ها",
          "احترام به انتظارات",
          "ثبات اولیه"
        ],
        recommendations: [
          "بررسی ارزش‌های خودتان",
          "جرأت سؤال کردن",
          "کشف هویت واقعی",
          "مشاوره در صورت نیاز"
        ]
      },
      diffuse: {
        name: "سبک سردرگم",
        color: "#dc2626",
        desc: "شما از تصمیمات هویتی اجتناب می‌کنید.",
        details: "این سبک مشکل‌سازترین است و می‌تواند به سردرگمی، بی‌هدفی و مشکلات روانی منجر شود.",
        strengths: [
          "اجتناب از فشار تصمیم‌گیری"
        ],
        recommendations: [
          "مشاوره هویت ضروری است",
          "کشف خود ساختاریافته",
          "تعیین اهداف کوچک",
          "مواجهه با ترس از تعهد",
          "کار با مشاور متخصص"
        ]
      }
    };
    return styles[style];
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


  const getInterpretation = (scores, dominantStyle) => {
    const styleInfo = getStyleInfo(dominantStyle);
    return {
      level: styleInfo.name,
      color: styleInfo.color,
      desc: styleInfo.desc,
      details: styleInfo.details,
      strengths: styleInfo.strengths,
      recommendations: styleInfo.recommendations
    };
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
    const dominantStyle = getDominantStyle(scores);
    const interpretation = getInterpretation(scores, dominantStyle);

    const chartData = {
      labels: ['اطلاعاتی', 'هنجاری', 'سردرگم'],
      datasets: [{
        label: 'نمره سبک‌ها',
        data: [scores.informational, scores.normative, scores.diffuse],
        backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(234, 179, 8, 0.6)', 'rgba(220, 38, 38, 0.6)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(220, 38, 38)'],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک‌های هویت برزونسکی</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک اطلاعاتی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#22c55e' }}>{scores.informational}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک هنجاری</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#eab308' }}>{scores.normative}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک سردرگم</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#dc2626' }}>{scores.diffuse}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-2">سبک غالب</h3>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{interpretation.desc}</div>
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

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Radar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, labels: { color: '#9ca3af' } },
                    title: { display: true, text: 'نمودار سبک‌های هویت', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 20,
                      ticks: { color: '#9ca3af', stepSize: 5 },
                      grid: { color: '#374151' },
                      pointLabels: { color: '#9ca3af' }
                    }
                  }
                }} />
              </div>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست سبک‌های هویت برزونسکی</h1>
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