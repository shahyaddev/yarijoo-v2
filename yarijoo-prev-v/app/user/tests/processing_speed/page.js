"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBolt } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("processing_speed");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "خواندن و درک متن",
    "یافتن اطلاعات",
    "پاسخ دادن به سوالات",
    "حل مسائل ساده",
    "تصمیم‌گیری سریع",
    "پردازش اطلاعات دیداری",
    "واکنش به محرک‌ها",
    "انجام کارهای تکراری",
    "جابجایی بین وظایف",
    "پردازش اطلاعات شنیداری"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "خیلی کند" },
    { value: 2, label: "کند" },
    { value: 3, label: "متوسط" },
    { value: 4, label: "سریع" },
    { value: 5, label: "خیلی سریع" }
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
    return Object.values(answers).reduce((sum, score) => sum + (score || 1), 0);
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
    const maxScore = 50; // 10 questions * 5 points each
    const percentage = (score / maxScore) * 100;
    
    if (percentage <= 40) {
      return {
        level: "سرعت پردازش کند",
        color: "#ef4444",
        desc: "سرعت پردازش اطلاعات شما کندتر از متوسط است.",
        details: "نمره شما نشان می‌دهد که سرعت پردازش اطلاعات در شما کندتر از متوسط است. این می‌تواند به معنای نیاز به زمان بیشتر برای انجام کارها باشد. مهم است بدانید که سرعت پردازش کند به معنای هوش پایین نیست - شما ممکن است دقت بالاتری داشته باشید.",
        strengths: [
          "دقت بالا در کارها",
          "توجه به جزئیات",
          "احتمالاً کیفیت کار بالا",
          "پتانسیل برای بهبود با تمرین"
        ],
        recommendations: [
          "درخواست زمان بیشتر در آزمون‌ها و موقعیت‌های کاری",
          "برنامه‌ریزی با زمان اضافی برای انجام کارها",
          "استفاده از استراتژی‌های کارآمد و سازماندهی شده",
          "تمرین تدریجی برای افزایش سرعت (بدون قربانی کردن کیفیت)",
          "اجتناب از کارهای تحت فشار شدید زمان",
          "استراحت منظم برای جلوگیری از خستگی ذهنی",
          "تمرین بازی‌های سرعتی ذهنی",
          "ورزش منظم و خواب کافی برای بهبود عملکرد شناختی",
          "کاهش استرس که می‌تواند سرعت پردازش را کند کند"
        ]
      };
    } else if (percentage <= 70) {
      return {
        level: "سرعت پردازش متوسط",
        color: "#eab308",
        desc: "سرعت پردازش اطلاعات شما در حد متوسط است.",
        details: "نمره شما نشان می‌دهد که سرعت پردازش اطلاعات در شما در حد متوسط است. شما می‌توانید کارهای خود را با سرعت مناسب انجام دهید. با تمرین و بهینه‌سازی می‌توانید سرعت خود را بهبود دهید.",
        strengths: [
          "سرعت پردازش مناسب",
          "تعادل بین سرعت و دقت",
          "عملکرد مناسب در بیشتر موقعیت‌ها"
        ],
        recommendations: [
          "تمرین منظم برای بهبود سرعت پردازش",
          "استفاده از تکنیک‌های بهینه‌سازی کارها",
          "تمرین بازی‌های ذهنی و چالش‌های سرعتی",
          "بهبود مهارت‌های خواندن و درک سریع",
          "تمرین تصمیم‌گیری سریع‌تر",
          "ورزش و تغذیه مناسب برای سلامت مغز",
          "خواب کافی برای عملکرد مطلوب شناختی"
        ]
      };
    } else {
      return {
        level: "سرعت پردازش سریع",
        color: "#22c55e",
        desc: "سرعت پردازش اطلاعات شما بالا است!",
        details: "نمره بالا شما نشان می‌دهد که سرعت پردازش اطلاعات در شما سریع است. شما می‌توانید اطلاعات را به سرعت پردازش کنید و در موقعیت‌های تحت فشار زمان عملکرد خوبی دارید. این یک مزیت بزرگ است.",
        strengths: [
          "سرعت پردازش بالا",
          "کارایی بالا در کارها",
          "واکنش سریع به محرک‌ها",
          "توانایی انجام کارهای بیشتر در زمان کمتر",
          "عملکرد مناسب در موقعیت‌های تحت فشار زمان"
        ],
        recommendations: [
          "استفاده از سرعت بالا برای کارهای تحت فشار زمان",
          "مراقب کیفیت باشید - گاهی سرعت بالا ممکن است دقت را کاهش دهد",
          "کمک به دیگران که سرعت پردازش کندتری دارند",
          "استفاده از این مزیت در کار و تحصیل",
          "ادامه تمرین برای حفظ سرعت",
          "استراحت منظم برای جلوگیری از فرسودگی ذهنی",
          "تمرین تکنیک‌های مدیریت زمان برای استفاده بهینه از سرعت"
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
    const maxScore = 50;

    const chartData = {
      labels: ["نمره شما", "کند (10-20)", "متوسط (21-35)", "سریع (36-50)"],
      datasets: [
        {
          label: "سرعت پردازش",
          data: [score, 20, 35, 50],
          backgroundColor: [
            interpretation.color + "B3",
            "rgba(239, 68, 68, 0.3)",
            "rgba(234, 179, 8, 0.3)",
            "rgba(34, 197, 94, 0.3)"
          ],
          borderColor: [
            interpretation.color,
            "#ef4444",
            "#eab308",
            "#22c55e"
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
          text: "سرعت پردازش اطلاعات",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 50,
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
                <FaBolt className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج سرعت پردازش</h1>
                <p className="text-secondaryTextColor">Processing Speed Assessment</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از {maxScore}
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
              <FaBolt className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">سرعت پردازش</h1>
              <p className="text-secondaryTextColor">چقدر سریع می‌توانید این کارها را انجام دهید:</p>
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