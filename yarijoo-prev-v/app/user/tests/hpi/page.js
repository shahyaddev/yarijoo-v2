"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserCircle } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hpi");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "معمولاً در مهمانی‌ها فعال هستم", scale: "extraversion" },
    { text: "به دیگران کمک می‌کنم", scale: "agreeableness" },
    { text: "مسئولیت‌پذیرم", scale: "conscientiousness" },
    { text: "تحت فشار آرام می‌مانم", scale: "emotional_stability" },
    { text: "ایده‌های جدید دارم", scale: "openness" },
    { text: "رهبری می‌کنم", scale: "ambition" },
    { text: "با مردم خوب کنار می‌آیم", scale: "sociability" },
    { text: "دقیق و منظم هستم", scale: "prudence" },
    { text: "کنجکاو و علاقه‌مند به یادگیری هستم", scale: "inquisitive" },
    { text: "تعهد به کارم دارم", scale: "learning_approach" }
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
      extraversion: 0,
      agreeableness: 0,
      conscientiousness: 0,
      emotional_stability: 0,
      openness: 0,
      ambition: 0,
      sociability: 0,
      prudence: 0,
      inquisitive: 0,
      learning_approach: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      scaleScores[q.scale] += answer;
    });

    const totalScore = Object.values(scaleScores).reduce((sum, val) => sum + val, 0);
    return { ...scaleScores, totalScore };
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
      extraversion: "برون‌گرایی",
      agreeableness: "خوش‌برخوردی",
      conscientiousness: "وجدان‌مندی",
      emotional_stability: "ثبات عاطفی",
      openness: "گشودگی",
      ambition: "جاه‌طلبی",
      sociability: "اجتماعی بودن",
      prudence: "احتیاط",
      inquisitive: "کنجکاوی",
      learning_approach: "رویکرد یادگیری"
    };

    const maxScale = Object.keys(scores).filter(k => k !== "totalScore").reduce((a, b) => scores[a] > scores[b] ? a : b);
    const percentage = (scores.totalScore / 10) * 100;

    if (percentage >= 70) {
      return {
        level: "شخصیت قوی و سالم",
        color: "#22c55e",
        desc: "ویژگی‌های شخصیتی شما قوی و متعادل است.",
        details: `نمره شما نشان می‌دهد که شما دارای ویژگی‌های شخصیتی قوی و سالم هستید. در مقیاس ${scaleNames[maxScale]} نمره بالاتری دارید. این ویژگی‌ها می‌تواند به شما در موفقیت شغلی و زندگی کمک کند.`,
        strengths: ["ویژگی‌های شخصیتی قوی", "تعادل در ابعاد مختلف", "پتانسیل موفقیت بالا"],
        recommendations: ["حفظ و تقویت ویژگی‌های مثبت", "استفاده از نقاط قوت در کار و زندگی", "ادامه رشد و توسعه شخصی"]
      };
    } else if (percentage >= 40) {
      return {
        level: "شخصیت متعادل",
        color: "#eab308",
        desc: "ویژگی‌های شخصیتی شما در سطح متوسط است.",
        details: `نمره شما نشان می‌دهد که ویژگی‌های شخصیتی شما در حد متوسط است. در مقیاس ${scaleNames[maxScale]} نمره بالاتری دارید. با تمرین و توسعه می‌توانید ویژگی‌های خود را تقویت کنید.`,
        strengths: ["ویژگی‌های شخصیتی پایه", "پتانسیل برای رشد"],
        recommendations: [
          "شناسایی و تقویت نقاط قوت",
          "کار بر روی بهبود ویژگی‌های ضعیف‌تر",
          "یادگیری مهارت‌های جدید",
          "دریافت بازخورد از دیگران"
        ]
      };
    } else {
      return {
        level: "نیاز به توسعه",
        color: "#ef4444",
        desc: "برخی ویژگی‌های شخصیتی نیاز به تقویت دارند.",
        details: `نمره پایین شما نشان می‌دهد که برخی ویژگی‌های شخصیتی نیاز به تقویت دارند. این می‌تواند بر عملکرد و روابط شما تأثیر بگذارد. با تمرین و یادگیری می‌توانید ویژگی‌های خود را بهبود دهید.`,
        strengths: ["آگاهی از نیاز به بهبود", "پتانسیل برای تغییر"],
        recommendations: [
          "مشاوره با روان‌شناس برای توسعه شخصیت",
          "کار بر روی بهبود ویژگی‌های شخصیتی",
          "یادگیری مهارت‌های بین فردی",
          "دریافت آموزش و راهنمایی",
          "تمرین و اجرای مهارت‌های جدید"
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
      labels: ["برون‌گرایی", "خوش‌برخوردی", "وجدان‌مندی", "ثبات عاطفی", "گشودگی", "جاه‌طلبی", "اجتماعی", "احتیاط", "کنجکاوی", "یادگیری"],
      datasets: [
        {
          label: "نمرات مقیاس‌ها",
          data: [
            scores.extraversion,
            scores.agreeableness,
            scores.conscientiousness,
            scores.emotional_stability,
            scores.openness,
            scores.ambition,
            scores.sociability,
            scores.prudence,
            scores.inquisitive,
            scores.learning_approach
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
          text: "نمرات مقیاس‌های شخصیت HPI",
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
                <FaUserCircle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست شخصیت HPI</h1>
                <p className="text-secondaryTextColor">Hogan Personality Inventory</p>
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
              <FaUserCircle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست شخصیت HPI</h1>
              <p className="text-secondaryTextColor">Hogan Personality Inventory</p>
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