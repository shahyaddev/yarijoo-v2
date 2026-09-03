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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("iq_full");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    {
      text: "کدام عدد بعدی در دنباله است؟ 2, 4, 8, 16, ...",
      options: ["20", "24", "32", "64"],
      correct: 2,
      type: "pattern"
    },
    {
      text: "اگر همه A ها B هستند و همه B ها C هستند، پس:",
      options: ["همه A ها C هستند", "هیچ A ای C نیست", "برخی A ها C هستند", "نمی‌توان گفت"],
      correct: 0,
      type: "logic"
    },
    {
      text: "واژه متضاد 'گرم' چیست؟",
      options: ["سرد", "یخ", "آتش", "تابستان"],
      correct: 0,
      type: "verbal"
    },
    {
      text: "13 + 27 = ?",
      options: ["39", "40", "41", "42"],
      correct: 1,
      type: "math"
    },
    {
      text: "کدام یکی متفاوت است؟ سگ، گربه، پرنده، ماهی",
      options: ["سگ", "گربه", "پرنده", "همه یکسان"],
      correct: 2,
      type: "classification"
    },
    {
      text: "5 × 9 = ?",
      options: ["40", "44", "45", "54"],
      correct: 2,
      type: "math"
    },
    {
      text: "واژه مترادف 'شاد' چیست؟",
      options: ["غمگین", "خوشحال", "عصبانی", "خسته"],
      correct: 1,
      type: "verbal"
    },
    {
      text: "100 - 37 = ?",
      options: ["63", "73", "67", "53"],
      correct: 0,
      type: "math"
    },
    {
      text: "کدام شکل بعدی است؟ ○ △ ○ △ ○ ?",
      options: ["○", "△", "□", "◇"],
      correct: 1,
      type: "pattern"
    },
    {
      text: "اگر همه مربع‌ها مستطیل هستند، آیا همه مستطیل‌ها مربع هستند؟",
      options: ["بله", "خیر", "گاهی", "نمی‌دانم"],
      correct: 1,
      type: "logic"
    }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questionsData.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const calculateTypeScores = () => {
    const typeScores = {
      pattern: { correct: 0, total: 0 },
      logic: { correct: 0, total: 0 },
      verbal: { correct: 0, total: 0 },
      math: { correct: 0, total: 0 },
      classification: { correct: 0, total: 0 }
    };

    questionsData.forEach((q, idx) => {
      typeScores[q.type].total++;
      if (answers[idx] === q.correct) {
        typeScores[q.type].correct++;
      }
    });

    return typeScores;
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
    const percentage = (score / questions.length) * 100;
    const estimatedIQ = 70 + (percentage * 1.3); // Rough estimation

    if (percentage >= 90) {
      return {
        level: "عالی",
        color: "#22c55e",
        desc: "عملکرد شما در تست هوش عالی است.",
        details: `شما ${score} از ${questions.length} سوال را به درستی پاسخ دادید (${Math.round(percentage)}%). این نشان می‌دهد که شما توانایی‌های شناختی بالایی دارید. این تست فقط یک برآورد کلی است و برای ارزیابی دقیق‌تر نیاز به تست‌های استاندارد حرفه‌ای است.`,
        estimatedIQ: Math.round(estimatedIQ),
        strengths: ["توانایی استدلال بالا", "مهارت‌های حل مسئله قوی", "درک منطقی خوب"],
        recommendations: [
          "حفظ و تقویت مهارت‌های شناختی",
          "ادامه یادگیری و چالش‌های فکری",
          "استفاده از توانایی‌های خود در کار و تحصیل"
        ]
      };
    } else if (percentage >= 70) {
      return {
        level: "خوب",
        color: "#eab308",
        desc: "عملکرد شما در تست هوش خوب است.",
        details: `شما ${score} از ${questions.length} سوال را به درستی پاسخ دادید (${Math.round(percentage)}%). این نشان می‌دهد که شما توانایی‌های شناختی مناسبی دارید. با تمرین می‌توانید مهارت‌های خود را بهبود دهید.`,
        estimatedIQ: Math.round(estimatedIQ),
        strengths: ["توانایی استدلال مناسب", "مهارت‌های حل مسئله", "درک منطقی"],
        recommendations: [
          "تمرین بیشتر برای بهبود مهارت‌های شناختی",
          "حل مسائل و چالش‌های فکری",
          "یادگیری تکنیک‌های حل مسئله"
        ]
      };
    } else if (percentage >= 50) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "عملکرد شما در تست هوش متوسط است.",
        details: `شما ${score} از ${questions.length} سوال را به درستی پاسخ دادید (${Math.round(percentage)}%). این تست فقط یک برآورد کلی است و ممکن است تحت تأثیر عوامل مختلفی مانند استرس یا خستگی قرار گرفته باشد.`,
        estimatedIQ: Math.round(estimatedIQ),
        strengths: ["توانایی پایه استدلال", "پتانسیل برای بهبود"],
        recommendations: [
          "تمرین منظم برای بهبود مهارت‌های شناختی",
          "حل مسائل ساده و افزایش تدریجی دشواری",
          "یادگیری تکنیک‌های حل مسئله",
          "در صورت نیاز، مشاوره با متخصص"
        ]
      };
    } else {
      return {
        level: "نیاز به تمرین",
        color: "#ef4444",
        desc: "عملکرد شما در این تست نیاز به بهبود دارد.",
        details: `شما ${score} از ${questions.length} سوال را به درستی پاسخ دادید (${Math.round(percentage)}%). این تست فقط یک برآورد کلی است و ممکن است تحت تأثیر عوامل مختلفی قرار گرفته باشد. با تمرین و یادگیری می‌توانید مهارت‌های خود را بهبود دهید.`,
        estimatedIQ: Math.round(estimatedIQ),
        strengths: ["پتانسیل برای بهبود", "آگاهی از نیاز به تمرین"],
        recommendations: [
          "تمرین منظم و تدریجی",
          "شروع با مسائل ساده",
          "یادگیری تکنیک‌های حل مسئله",
          "دریافت راهنمایی و آموزش",
          "در صورت نیاز، مشاوره با متخصص برای بررسی دقیق‌تر"
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
    const typeScores = calculateTypeScores();

    const chartData = {
      labels: ["الگوها", "منطق", "کلامی", "ریاضی", "طبقه‌بندی"],
      datasets: [
        {
          label: "نمرات بر اساس نوع",
          data: [
            typeScores.pattern.correct,
            typeScores.logic.correct,
            typeScores.verbal.correct,
            typeScores.math.correct,
            typeScores.classification.correct
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
          text: "نمرات بر اساس نوع سوالات",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 3,
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست هوش</h1>
                <p className="text-secondaryTextColor">IQ Test - Full Assessment</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از {questions.length}
              </div>
              <div className="text-lg font-semibold mb-2" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
              <p className="text-sm text-secondaryTextColor">
                برآورد تقریبی IQ: {interpretation.estimatedIQ}
              </p>
              <p className="text-xs text-secondaryTextColor mt-2 italic">
                * این فقط یک برآورد تقریبی است و برای ارزیابی دقیق نیاز به تست‌های استاندارد حرفه‌ای است.
              </p>
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار عملکرد بر اساس نوع سوالات</h3>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست هوش</h1>
              <p className="text-secondaryTextColor">IQ Test - Full Assessment</p>
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
              {questionsData[currentQuestion].text}
            </h3>
            <div className="space-y-3">
              {questionsData[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-medium">{option}</span>
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