"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBriefcase } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("job_satisfaction");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "از شغلم راضی هستم",
    "کارم برایم جذاب است",
    "از رفتن سر کار لذت می‌برم",
    "حقوقم منصفانه است",
    "فرصت‌های ارتقا دارم",
    "مدیرم حمایت‌گر است",
    "همکارانم خوب هستند",
    "محیط کار مناسب است",
    "کارم چالش‌برانگیز است",
    "از مهارت‌هایم استفاده می‌شود",
    "کارم معنادار است",
    "به اهدافم می‌رسم",
    "تعادل کار-زندگی دارم",
    "امنیت شغلی دارم",
    "در تصمیمات شرکت می‌کنم",
    "قدردانی می‌شوم",
    "آموزش‌های لازم را می‌گیرم",
    "می‌خواهم در این شغل بمانم"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "نه موافق نه مخالف" },
    { value: 4, label: "موافقم" },
    { value: 5, label: "کاملاً موافقم" }
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
    const maxScore = 90;
    
    if (score <= 25) {
      return {
        level: "رضایت شغلی بسیار پایین",
        color: "#dc2626",
        desc: "شما رضایت بسیار کمی از شغل فعلی خود دارید. این وضعیت می‌تواند تأثیرات منفی قابل توجهی بر سلامت روان و عملکرد شما داشته باشد.",
        details: "نمره شما نشان می‌دهد که در اکثر جنبه‌های شغلی خود احساس نارضایتی می‌کنید. این وضعیت می‌تواند منجر به فرسودگی شغلی، استرس مزمن، کاهش انگیزه و مشکلات سلامتی شود.",
        strengths: [
          "توانایی شناسایی نارضایتی شغلی",
          "آگاهی از نیازهای شغلی خود",
          "انگیزه برای بهبود وضعیت"
        ],
        recommendations: [
          "شناسایی دقیق منابع اصلی نارضایتی شغلی",
          "مشاوره با مشاور شغلی یا روانشناس سازمانی",
          "بررسی امکان تغییر شغل یا سازمان",
          "مذاکره با مدیر درباره بهبود شرایط کاری",
          "توسعه مهارت‌های جدید برای افزایش گزینه‌های شغلی",
          "ایجاد برنامه‌ای برای مدیریت استرس شغلی"
        ]
      };
    } else if (score <= 50) {
      return {
        level: "رضایت شغلی پایین",
        color: "#ef4444",
        desc: "رضایت شغلی شما در سطح پایینی قرار دارد. بسیاری از جنبه‌های شغلی شما نیازمند بهبود هستند.",
        details: "در حال حاضر نارضایتی‌های قابل توجهی از شغل خود دارید که می‌تواند بر انگیزه، عملکرد و کیفیت زندگی شما تأثیر بگذارد. شناسایی و رفع این مشکلات برای سلامت حرفه‌ای شما ضروری است.",
        strengths: [
          "برخی جنبه‌های مثبت در کار وجود دارد",
          "ظرفیت برای بهبود و رشد",
          "توانایی ارزیابی شرایط شغلی"
        ],
        recommendations: [
          "تهیه لیست دقیق از جنبه‌های نارضایی‌بخش شغل",
          "گفتگوی سازنده با مدیر درباره چالش‌ها",
          "جستجوی فرصت‌های رشد در سازمان فعلی",
          "بهبود مهارت‌های ارتباطی و حل مسئله",
          "ایجاد شبکه حرفه‌ای قوی‌تر",
          "تقویت تعادل کار-زندگی"
        ]
      };
    } else if (score <= 75) {
      return {
        level: "رضایت شغلی متوسط",
        color: "#eab308",
        desc: "رضایت شغلی شما در سطح متوسطی است. برخی جنبه‌های شغلی رضایت‌بخش هستند، اما فضای بهبود وجود دارد.",
        details: "شما احساس رضایت نسبی از شغل خود دارید، اما هنوز جنبه‌هایی وجود دارند که نیاز به بهبود دارند. با تمرکز بر نقاط قوت و رفع چالش‌ها، می‌توانید رضایت شغلی خود را افزایش دهید.",
        strengths: [
          "تعادل نسبی بین جنبه‌های مثبت و منفی شغل",
          "پایه‌ای برای بهبود و پیشرفت",
          "انگیزه کافی برای ادامه کار",
          "برخی روابط کاری مثبت"
        ],
        recommendations: [
          "شناسایی و تقویت جنبه‌های مثبت شغل",
          "تلاش برای بهبود جنبه‌های ضعیف",
          "تعیین اهداف شغلی واضح",
          "درخواست بازخورد منظم از مدیر",
          "مشارکت در پروژه‌های جدید و چالش‌برانگیز",
          "توسعه مهارت‌های حرفه‌ای"
        ]
      };
    } else if (score <= 81) {
      return {
        level: "رضایت شغلی خوب",
        color: "#10b981",
        desc: "شما رضایت خوبی از شغل خود دارید. اکثر جنبه‌های شغلی شما رضایت‌بخش هستند و محیط کاری مناسبی دارید.",
        details: "رضایت شغلی خوب شما نشان‌دهنده تطابق مناسب بین انتظارات، ارزش‌ها و واقعیت شغلی شماست. این وضعیت مثبت می‌تواند منجر به عملکرد بهتر، انگیزه بیشتر و سلامت روانی بهتر شود.",
        strengths: [
          "رضایت از اکثر جنبه‌های شغلی",
          "انگیزه و اشتیاق برای کار",
          "روابط مثبت با همکاران و مدیران",
          "احساس ارزشمندی و قدردانی",
          "تعادل نسبتاً خوب کار-زندگی"
        ],
        recommendations: [
          "حفظ و تقویت وضعیت فعلی",
          "اشتراک تجربیات مثبت با همکاران",
          "تلاش برای رشد و پیشرفت بیشتر",
          "کمک به ایجاد فرهنگ سازمانی مثبت",
          "توسعه مهارت‌های رهبری و مربیگری",
          "تعیین اهداف بلندمدت شغلی"
        ]
      };
    } else {
      return {
        level: "رضایت شغلی عالی",
        color: "#22c55e",
        desc: "شما رضایت بسیار بالایی از شغل خود دارید. تقریباً تمام جنبه‌های شغلی شما با انتظارات و ارزش‌های شما همخوانی دارد.",
        details: "رضایت شغلی عالی شما نشان‌دهنده وضعیتی ایده‌آل است که در آن احساس ارزشمندی، معناداری و موفقیت می‌کنید. این سطح از رضایت با عملکرد برتر، خلاقیت بالا، تعهد سازمانی قوی و سلامت روانی مطلوب همراه است.",
        strengths: [
          "رضایت کامل از تمام ابعاد شغلی",
          "انگیزه و اشتیاق بسیار بالا",
          "روابط عالی با همکاران و مدیران",
          "احساس معناداری و هدفمندی در کار",
          "تعادل عالی کار-زندگی",
          "فرصت‌های رشد و یادگیری مستمر"
        ],
        recommendations: [
          "ادامه مسیر فعلی و حفظ این وضعیت عالی",
          "الگو و منتور بودن برای دیگران",
          "مشارکت در بهبود فرهنگ سازمانی",
          "تعیین اهداف چالش‌برانگیزتر",
          "اشتراک بهترین شیوه‌ها با همکاران",
          "کمک به رشد و توسعه تیم و سازمان"
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
      labels: ["نمره شما", "حداقل", "متوسط", "حداکثر"],
      datasets: [
        {
          label: "رضایت شغلی",
          data: [score, 18, 54, 90],
          backgroundColor: ["#3b82f6", "#94a3b8", "#64748b", "#22c55e"],
          borderColor: ["#2563eb", "#64748b", "#475569", "#16a34a"],
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
          text: "مقایسه نمره شما با محدوده‌های مختلف",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 90,
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
                <FaBriefcase className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست رضایت شغلی</h1>
                <p className="text-secondaryTextColor">تحلیل کامل رضایت شغلی شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 90
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار مقایسه‌ای</h3>
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
              <FaBriefcase className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست رضایت شغلی</h1>
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