"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaLeaf } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("mofs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "توجه کامل به لحظه حال دارم",
    "بدون قضاوت مشاهده می‌کنم",
    "با آگاهی عمل می‌کنم",
    "به حس‌های بدنی توجه می‌کنم",
    "افکار را بیایند و بروند می‌گذارم",
    "در حال حاضر هستم",
    "پذیرای تجربیاتم هستم",
    "احساسات را می‌پذیرم",
    "بدون واکنش خودکار عمل می‌کنم",
    "به نفس‌هایم آگاه هستم"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "هرگز" },
    { value: 2, label: "به ندرت" },
    { value: 3, label: "گاهی" },
    { value: 4, label: "اغلب" },
    { value: 5, label: "همیشه" }
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
    
    if (score <= 20) {
      return {
        level: "ذهن‌آگاهی پایین",
        color: "#ef4444",
        desc: "سطح ذهن‌آگاهی شما پایین است. شما به ندرت در لحظه حال حاضر هستید و ممکن است درگیر افکار و نگرانی‌های گذشته یا آینده باشید.",
        details: "نمره پایین شما نشان می‌دهد که تمرین ذهن‌آگاهی می‌تواند برای شما بسیار مفید باشد. ذهن‌آگاهی پایین می‌تواند منجر به استرس بیشتر، نارضایتی و کاهش کیفیت زندگی شود.",
        strengths: [
          "آگاهی از نیاز به بهبود",
          "پتانسیل برای رشد و یادگیری",
          "تمایل به تغییر"
        ],
        recommendations: [
          "شروع تمرینات روزانه مدیتیشن (حتی 5-10 دقیقه)",
          "برنامه MBSR (کاهش استرس مبتنی بر ذهن‌آگاهی)",
          "تمرین تمرکز بر نفس‌کشیدن",
          "آموزش رسمی ذهن‌آگاهی",
          "تمرین پذیرش بدون قضاوت",
          "ایجاد عادت بررسی لحظه‌ای حالت‌های خود"
        ]
      };
    } else if (score <= 30) {
      return {
        level: "ذهن‌آگاهی متوسط",
        color: "#eab308",
        desc: "سطح ذهن‌آگاهی شما متوسط است. گاهی اوقات در لحظه حال حاضر هستید اما هنوز در برخی موقعیت‌ها به افکار و نگرانی‌ها گرفتار می‌شوید.",
        details: "شما مهارت‌های پایه ذهن‌آگاهی را دارید اما نیاز به تمرین بیشتر و عمیق‌تر دارید. با ادامه تمرین می‌توانید ذهن‌آگاهی خود را تقویت کنید.",
        strengths: [
          "برخی مهارت‌های ذهن‌آگاهی",
          "توانایی حضور در لحظه (گاهی)",
          "آگاهی از نیاز به بهبود",
          "پایه برای رشد بیشتر"
        ],
        recommendations: [
          "افزایش زمان مدیتیشن روزانه",
          "تمرین ذهن‌آگاهی در فعالیت‌های روزمره",
          "شرکت در دوره‌های پیشرفته ذهن‌آگاهی",
          "تمرین ذهن‌آگاهی خوردن (mindful eating)",
          "استفاده از اپلیکیشن‌های ذهن‌آگاهی",
          "تمرین ذهن‌آگاهی در روابط"
        ]
      };
    } else if (score <= 40) {
      return {
        level: "ذهن‌آگاهی خوب",
        color: "#22c55e",
        desc: "سطح ذهن‌آگاهی شما خوب است. شما اغلب در لحظه حال حاضر هستید و می‌توانید افکار و احساسات خود را بدون قضاوت مشاهده کنید.",
        details: "نمره خوب شما نشان‌دهنده این است که مهارت‌های ذهن‌آگاهی را به خوبی توسعه داده‌اید. این می‌تواند به کاهش استرس، افزایش آرامش و بهبود کیفیت زندگی شما کمک کند.",
        strengths: [
          "حضور در لحظه حال",
          "توانایی مشاهده بدون قضاوت",
          "پذیرش تجربیات",
          "آگاهی از حالت‌های بدن",
          "کنترل بر واکنش‌ها"
        ],
        recommendations: [
          "حفظ و تقویت تمرینات روزانه",
          "کمک به دیگران در یادگیری ذهن‌آگاهی",
          "ادامه توسعه مهارت‌های پیشرفته",
          "تمرین ذهن‌آگاهی در موقعیت‌های چالش‌برانگیز",
          "اشتراک تجربیات با دیگران",
          "ادامه مسیر رشد معنوی"
        ]
      };
    } else {
      return {
        level: "ذهن‌آگاهی عالی",
        color: "#16a34a",
        desc: "سطح ذهن‌آگاهی شما عالی است! شما به طور مداوم در لحظه حال حاضر هستید و می‌توانید افکار، احساسات و تجربیات خود را با آگاهی کامل و بدون قضاوت مشاهده کنید.",
        details: "نمره عالی شما نشان‌دهنده تسلط بر مهارت‌های ذهن‌آگاهی است. این سطح از ذهن‌آگاهی می‌تواند منجر به آرامش عمیق، کاهش قابل توجه استرس و افزایش رضایت از زندگی شود.",
        strengths: [
          "حضور کامل در لحظه حال",
          "مشاهده بدون قضاوت",
          "پذیرش کامل تجربیات",
          "آگاهی عمیق از بدن و نفس",
          "کنترل عالی بر واکنش‌ها",
          "صلح درونی"
        ],
        recommendations: [
          "حفظ و عمیق‌تر کردن تمرینات",
          "منتور شدن برای دیگران",
          "تدریس ذهن‌آگاهی",
          "شرکت در دوره‌های پیشرفته",
          "ادامه سفر معنوی",
          "کمک به ایجاد جامعه ذهن‌آگاهی"
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
      labels: ["نمره شما", "پایین (10-20)", "متوسط (21-30)", "خوب (31-40)", "عالی (41-50)"],
      datasets: [
        {
          label: "MOFS Score",
          data: [score, 20, 30, 40, 50],
          backgroundColor: [
            interpretation.color + "B3",
            "rgba(239, 68, 68, 0.3)",
            "rgba(234, 179, 8, 0.3)",
            "rgba(34, 197, 94, 0.3)",
            "rgba(22, 163, 74, 0.3)"
          ],
          borderColor: [
            interpretation.color,
            "#ef4444",
            "#eab308",
            "#22c55e",
            "#16a34a"
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
          text: "مقیاس مشاهده احساسات ذهن‌آگاهی (MOFS)",
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
                <FaLeaf className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس مشاهده احساسات ذهن‌آگاهی</h1>
                <p className="text-secondaryTextColor">Mindfulness Observing Feeling Scale (MOFS)</p>
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
              <FaLeaf className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس مشاهده احساسات ذهن‌آگاهی (MOFS)</h1>
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