"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaFlame } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("markham_stress");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "ناراحت شدید به خاطر اتفاقی که غیرمنتظره رخ داد", reverse: false },
    { text: "احساس کردید نمی‌توانید چیزهای مهم زندگی را کنترل کنید", reverse: false },
    { text: "احساس عصبی بودن و استرس کردید", reverse: false },
    { text: "با موفقیت با مشکلات آزاردهنده مقابله کردید", reverse: true },
    { text: "احساس کردید به طور مؤثر با تغییرات مهم زندگی کنار آمدید", reverse: true },
    { text: "اطمینان داشتید که می‌توانید با مسئولیت‌های شخصی کنار بیایید", reverse: true },
    { text: "احساس کردید همه چیز در مسیر خودش پیش می‌رود", reverse: true },
    { text: "دریافتید که نمی‌توانید با همه کارهایی که باید انجام دهید کنار بیایید", reverse: false },
    { text: "توانستید بر خشم خود کنترل داشته باشید", reverse: true },
    { text: "احساس کردید همه چیز بالای سرتان جمع شده", reverse: false }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "هرگز" },
    { value: 1, label: "تقریباً هرگز" },
    { value: 2, label: "گاهی" },
    { value: 3, label: "نسبتاً اغلب" },
    { value: 4, label: "خیلی اغلب" }
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
    let totalScore = 0;
    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (q.reverse) {
        totalScore += (4 - answer); // Reverse scoring: 0 becomes 4, 4 becomes 0
      } else {
        totalScore += answer;
      }
    });
    return totalScore;
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
    const maxScore = 40; // 10 questions * 4 points each (after reverse)
    
    if (score <= 10) {
      return {
        level: "استرس بسیار پایین",
        color: "#22c55e",
        desc: "شما استرس بسیار کمی را تجربه می‌کنید و کنترل خوبی بر زندگی خود دارید.",
        details: "نمره پایین شما نشان می‌دهد که شما استرس بسیار کمی را تجربه می‌کنید و مهارت‌های خوبی در مدیریت استرس و مقابله با مشکلات دارید. شما احساس کنترل بر زندگی خود دارید و می‌توانید به طور مؤثر با چالش‌ها کنار بیایید.",
        strengths: [
          "کنترل مناسب بر زندگی",
          "مهارت‌های مؤثر مدیریت استرس",
          "مقابله موفق با مشکلات",
          "کنترل مناسب خشم و هیجانات",
          "عملکرد مناسب در شرایط مختلف",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ مهارت‌های فعلی مدیریت استرس",
          "ادامه سبک زندگی سالم و متعادل",
          "حفظ روابط اجتماعی و حمایت",
          "ادامه فعالیت‌هایی که به شما کمک می‌کند",
          "کمک به دیگران در یادگیری مهارت‌های مدیریت استرس"
        ]
      };
    } else if (score <= 20) {
      return {
        level: "استرس متوسط",
        color: "#eab308",
        desc: "شما استرس متوسطی را تجربه می‌کنید که طبیعی است اما می‌تواند بهبود یابد.",
        details: "نمره متوسط شما نشان می‌دهد که شما استرس متوسطی را تجربه می‌کنید. این سطح طبیعی است اما با یادگیری و تمرین مهارت‌های مدیریت استرس می‌توانید سطح استرس خود را کاهش دهید و کنترل بهتری بر زندگی خود داشته باشید.",
        strengths: [
          "برخی مهارت‌های مدیریت استرس",
          "کنترل نسبی بر زندگی",
          "آگاهی از نیاز به بهبود"
        ],
        recommendations: [
          "یادگیری تکنیک‌های مدیریت استرس (تنفس عمیق، آرام‌سازی)",
          "تمرین ذهن‌آگاهی و مدیتیشن",
          "برنامه‌ریزی و سازماندهی کارها برای کاهش احساس فشار",
          "شناسایی عوامل استرس‌زا و کار بر روی کاهش آن‌ها",
          "ورزش منظم و فعالیت‌های لذت‌بخش",
          "تقویت مهارت‌های مقابله‌ای",
          "حفظ روابط اجتماعی و حمایت"
        ]
      };
    } else if (score <= 30) {
      return {
        level: "استرس بالا",
        color: "#f97316",
        desc: "شما استرس بالایی را تجربه می‌کنید که نیاز به توجه دارد.",
        details: "نمره شما نشان می‌دهد که شما استرس بالایی را تجربه می‌کنید. این می‌تواند بر سلامت روانی و جسمی شما تأثیر بگذارد و عملکرد روزانه شما را مختل کند. بهتر است با متخصص مشورت کنید و مهارت‌های مدیریت استرس را یاد بگیرید.",
        strengths: [
          "آگاهی از سطح استرس",
          "تمایل به بهبود"
        ],
        recommendations: [
          "مراجعه به روان‌شناس برای یادگیری تکنیک‌های مدیریت استرس",
          "درمان شناختی-رفتاری (CBT) برای تغییر ارزیابی استرس‌زا از وقایع",
          "تمرین منظم تکنیک‌های آرام‌سازی (پیشرونده عضلانی، تنفس عمیق)",
          "بررسی و تغییر سبک زندگی پراسترس",
          "شناسایی و حذف عوامل استرس‌زای غیرضروری",
          "ایجاد سیستم حمایتی قوی",
          "ورزش منظم و خواب کافی",
          "در صورت نیاز، مشورت با پزشک برای بررسی علل جسمی استرس"
        ]
      };
    } else {
      return {
        level: "استرس بسیار بالا",
        color: "#ef4444",
        desc: "شما استرس بسیار بالایی را تجربه می‌کنید که نیاز به مداخله فوری دارد.",
        details: "نمره بالا شما نشان می‌دهد که شما استرس بسیار بالایی را تجربه می‌کنید. این سطح از استرس می‌تواند به شدت بر سلامت روانی و جسمی شما تأثیر بگذارد و منجر به مشکلات جدی مانند اضطراب، افسردگی، مشکلات خواب و بیماری‌های جسمی شود. نیاز به مداخله فوری و تخصصی است.",
        strengths: [
          "شناسایی مشکل",
          "جستجوی کمک"
        ],
        recommendations: [
          "🚨 مراجعه فوری به روان‌شناس یا روان‌پزشک",
          "درمان فشرده مدیریت استرس",
          "درمان شناختی-رفتاری (CBT) برای تغییر الگوهای فکری استرس‌زا",
          "بررسی دقیق علل استرس و کار بر روی تغییر آن‌ها",
          "یادگیری تکنیک‌های مدیریت بحران استرس",
          "برنامه درمانی جامع شامل روان‌درمانی و احتمالاً دارودرمانی",
          "ایجاد تغییرات اساسی در سبک زندگی",
          "استراحت و مراقبت از خود",
          "بررسی احتمال اختلالات همزمان (اضطراب، افسردگی)",
          "در صورت وجود افکار خودکشی، تماس فوری با خط بحران"
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
    const maxScore = 40;

    const chartData = {
      labels: ["نمره شما", "پایین (0-10)", "متوسط (11-20)", "بالا (21-30)", "خیلی بالا (31-40)"],
      datasets: [
        {
          label: "استرس مارکهام",
          data: [score, 10, 20, 30, 40],
          backgroundColor: [
            interpretation.color + "B3",
            "rgba(34, 197, 94, 0.3)",
            "rgba(234, 179, 8, 0.3)",
            "rgba(249, 115, 22, 0.3)",
            "rgba(239, 68, 68, 0.3)"
          ],
          borderColor: [
            interpretation.color,
            "#22c55e",
            "#eab308",
            "#f97316",
            "#ef4444"
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
          text: "مقیاس استرس مارکهام",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 40,
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
                <FaFlame className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس استرس مارکهام</h1>
                <p className="text-secondaryTextColor">Markham Stress Scale</p>
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
              <FaFlame className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس استرس مارکهام</h1>
              <p className="text-secondaryTextColor">در ماه گذشته، چند بار:</p>
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