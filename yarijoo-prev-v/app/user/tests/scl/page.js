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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("scl");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "سردرد", dimension: "somatization" },
    { text: "عصبی بودن", dimension: "anxiety" },
    { text: "افکار ناخواسته", dimension: "obsessive_compulsive" },
    { text: "احساس ضعف", dimension: "depression" },
    { text: "احساس تنش", dimension: "anxiety" },
    { text: "تکرار کارها", dimension: "obsessive_compulsive" },
    { text: "غمگینی", dimension: "depression" },
    { text: "احساس بیگانگی", dimension: "interpersonal_sensitivity" },
    { text: "پرخاشگری", dimension: "hostility" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "کمی" },
    { value: 2, label: "متوسط" },
    { value: 3, label: "زیاد" },
    { value: 4, label: "خیلی زیاد" }
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
    const dimensions = {
      somatization: 0,
      anxiety: 0,
      obsessive_compulsive: 0,
      depression: 0,
      interpersonal_sensitivity: 0,
      hostility: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (dimensions[q.dimension] !== undefined) {
        dimensions[q.dimension] += answer;
      }
    });

    const totalScore = Object.values(dimensions).reduce((sum, val) => sum + val, 0);

    return { ...dimensions, totalScore };
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
    const { totalScore, somatization, anxiety, depression } = scores;
    
    if (totalScore <= 9) {
      return {
        level: "شدت پایین",
        color: "#22c55e",
        desc: "علائم روانشناختی در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که علائم روانشناختی در حد طبیعی است و سلامت روانی شما خوب است. شما به طور کلی احساس خوبی دارید و علائم قابل توجهی را تجربه نمی‌کنید.",
        strengths: [
          "سلامت روانی خوب",
          "عدم علائم قابل توجه",
          "عملکرد مناسب",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ سلامت روانی فعلی",
          "ادامه فعالیت‌های مثبت و سالم",
          "پایش منظم سلامت روانی",
          "حفظ روابط سالم",
          "مدیریت استرس به صورت مؤثر"
        ]
      };
    } else if (totalScore <= 18) {
      return {
        level: "شدت متوسط",
        color: "#eab308",
        desc: "علائم روانشناختی متوسط وجود دارد که نیاز به توجه دارد.",
        details: "نمره شما نشان می‌دهد که برخی علائم روانشناختی متوسط را تجربه می‌کنید. این علائم ممکن است بر عملکرد روزانه شما تأثیر بگذارند و نیاز به توجه و مدیریت دارند.",
        strengths: [
          "برخی منابع مقابله",
          "آگاهی از علائم",
          "پتانسیل برای بهبود"
        ],
        recommendations: [
          "یادگیری تکنیک‌های مدیریت استرس",
          "مشاوره با روان‌شناس برای بررسی عمیق‌تر",
          "تمرینات آرام‌سازی و ذهن‌آگاهی",
          "افزایش فعالیت‌های بدنی و ورزش",
          depression > 4 ? "بررسی احتمال افسردگی" : null,
          anxiety > 4 ? "یادگیری تکنیک‌های مدیریت اضطراب" : null,
          somatization > 4 ? "بررسی علل جسمانی علائم با پزشک" : null
        ].filter(Boolean)
      };
    } else {
      return {
        level: "شدت بالا",
        color: "#ef4444",
        desc: "علائم روانشناختی شدید وجود دارد که نیاز به ارزیابی فوری دارد.",
        details: "نمره بالا شما نشان می‌دهد که علائم روانشناختی شدید را تجربه می‌کنید. این علائم می‌توانند به طور قابل توجهی بر عملکرد، روابط و کیفیت زندگی شما تأثیر بگذارند. نیاز به ارزیابی و درمان تخصصی فوری است.",
        strengths: [
          "شناسایی مشکل",
          "جستجوی کمک",
          "آگاهی از نیاز به درمان"
        ],
        recommendations: [
          "مراجعه فوری به روان‌پزشک یا روان‌شناس",
          "ارزیابی جامع و تشخیص کامل",
          "درمان ترکیبی (دارو + روان‌درمانی) در صورت نیاز",
          "بررسی خطر خودکشی یا خودآسیبی",
          "درگیر کردن خانواده یا دوستان مورد اعتماد در روند درمان",
          "پیگیری منظم و نزدیک با متخصص",
          "یادگیری و تمرین تکنیک‌های مدیریت بحران",
          depression > 8 ? "درمان شناختی-رفتاری (CBT) برای افسردگی" : null,
          anxiety > 8 ? "درمان شناختی-رفتاری (CBT) برای اضطراب" : null
        ].filter(Boolean)
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
    const maxScore = questions.length * 4;

    const chartData = {
      labels: ["جسمانی‌سازی", "اضطراب", "وسواس-اجبار", "افسردگی", "حساسیت بین‌فردی", "پرخاشگری", "نمره کل"],
      datasets: [
        {
          label: "نمرات",
          data: [
            scores.somatization,
            scores.anxiety,
            scores.obsessive_compulsive,
            scores.depression,
            scores.interpersonal_sensitivity,
            scores.hostility,
            scores.totalScore
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.5)",
            "rgba(168, 85, 247, 0.5)",
            "rgba(59, 130, 246, 0.5)",
            "rgba(239, 68, 68, 0.5)",
            "rgba(249, 115, 22, 0.5)",
            "rgba(234, 179, 8, 0.5)",
            interpretation.color + "B3"
          ],
          borderColor: [
            "rgb(34, 197, 94)",
            "rgb(168, 85, 247)",
            "rgb(59, 130, 246)",
            "rgb(239, 68, 68)",
            "rgb(249, 115, 22)",
            "rgb(234, 179, 8)",
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
          text: "چک‌لیست علائم (SCL)",
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
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 9 } },
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج چک‌لیست علائم</h1>
                <p className="text-secondaryTextColor">Symptom Checklist (SCL)</p>
              </div>
            </div>

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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار زیرمقیاس‌ها</h3>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">چک‌لیست علائم (SCL)</h1>
              <p className="text-secondaryTextColor">در هفته گذشته، چقدر این مشکلات شما را آزار دادند:</p>
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