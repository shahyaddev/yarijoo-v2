"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaExclamationTriangle } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ptsd_symptoms");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "خاطرات ناخواسته و مزاحم از رویداد", cluster: "intrusion" },
    { text: "کابوس‌های تکراری درباره رویداد", cluster: "intrusion" },
    { text: "احساس یا عمل به گونه‌ای که رویداد دوباره اتفاق می‌افتد", cluster: "intrusion" },
    { text: "ناراحتی شدید با یادآوری رویداد", cluster: "intrusion" },
    { text: "واکنش‌های فیزیکی شدید به یادآوری", cluster: "intrusion" },
    { text: "اجتناب از افکار یا احساسات مربوط به رویداد", cluster: "avoidance" },
    { text: "اجتناب از یادآورهای خارجی رویداد", cluster: "avoidance" },
    { text: "مشکل در به یاد آوردن بخش‌های مهم رویداد", cluster: "cognition_mood" },
    { text: "باورهای منفی قوی درباره خود یا دنیا", cluster: "cognition_mood" },
    { text: "سرزنش خود یا دیگران برای رویداد", cluster: "cognition_mood" },
    { text: "احساسات منفی قوی", cluster: "cognition_mood" },
    { text: "از دست دادن علاقه به فعالیت‌ها", cluster: "cognition_mood" },
    { text: "احساس جدایی از دیگران", cluster: "cognition_mood" },
    { text: "مشکل در داشتن احساسات مثبت", cluster: "cognition_mood" },
    { text: "رفتار تحریک‌پذیر یا پرخاشگرانه", cluster: "arousal" },
    { text: "رفتارهای خطرناک یا مخرب", cluster: "arousal" },
    { text: "حالت هوشیاری بیش از حد", cluster: "arousal" },
    { text: "بیش از حد جا خوردن", cluster: "arousal" },
    { text: "مشکل در تمرکز", cluster: "arousal" },
    { text: "مشکل در خوابیدن یا ماندن در خواب", cluster: "arousal" }
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
    const clusters = {
      intrusion: 0,
      avoidance: 0,
      cognition_mood: 0,
      arousal: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (clusters[q.cluster] !== undefined) {
        clusters[q.cluster] += answer;
      }
    });

    const totalScore = Object.values(clusters).reduce((sum, val) => sum + val, 0);

    return { ...clusters, totalScore };
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
    const { totalScore, intrusion, avoidance, cognition_mood, arousal } = scores;
    
    if (totalScore <= 10) {
      return {
        level: "حداقلی",
        color: "#22c55e",
        desc: "علائم PTSD حداقلی است. این سطح طبیعی برای دوره کوتاه پس از تروما است.",
        details: "نمره شما نشان می‌دهد که علائم PTSD در حد حداقلی است. این سطح معمولاً طبیعی است، به خصوص در دوره کوتاه پس از تجربه یک رویداد استرس‌زا. با این حال، مهم است که به علائم خود توجه کنید و در صورت تداوم یا تشدید، کمک بگیرید.",
        strengths: [
          "علائم در حد کنترل شده",
          "عملکرد مناسب",
          "پتانسیل بهبود طبیعی"
        ],
        recommendations: [
          "پایش علائم به صورت منظم",
          "حفظ سبک زندگی سالم",
          "مدیریت استرس",
          "حفظ روابط اجتماعی و حمایت",
          "در صورت تداوم علائم، مشاوره با متخصص"
        ]
      };
    } else if (totalScore <= 30) {
      return {
        level: "خفیف تا متوسط",
        color: "#eab308",
        desc: "علائم PTSD خفیف تا متوسط وجود دارد. نیاز به توجه و مداخله دارد.",
        details: "نمره شما نشان می‌دهد که علائم PTSD در سطح خفیف تا متوسط وجود دارد. این علائم می‌توانند بر عملکرد روزانه شما تأثیر بگذارند. مراجعه به متخصص سلامت روان برای ارزیابی و درمان توصیه می‌شود.",
        strengths: [
          "آگاهی از علائم",
          "تمایل به جستجوی کمک"
        ],
        recommendations: [
          "مشاوره با روان‌شناس یا روان‌پزشک برای ارزیابی",
          "درمان شناختی-رفتاری متمرکز بر تروما (Trauma-focused CBT)",
          "EMDR (حرکت چشم و پردازش مجدد) در صورت نیاز",
          "یادگیری تکنیک‌های مدیریت استرس و آرام‌سازی",
          "گروه حمایتی برای بازماندگان تروما",
          "بررسی ایمنی: اطمینان از اینکه هنوز در خطر نیستید"
        ]
      };
    } else {
      return {
        level: "شدید - PTSD احتمالی",
        color: "#ef4444",
        desc: "علائم شدید PTSD وجود دارد که نشان‌دهنده احتمال PTSD است. نیاز به درمان تخصصی فوری دارد.",
        details: "نمره شما نشان می‌دهد که علائم شدید PTSD دارید که نیاز به ارزیابی و درمان تخصصی فوری دارد. این علائم می‌توانند به طور قابل توجهی بر تمام جنبه‌های زندگی شما تأثیر بگذارند. درمان تخصصی برای PTSD بسیار مؤثر است و بهبودی ممکن است.",
        strengths: [
          "شناسایی نیاز به کمک",
          "تمایل به درمان"
        ],
        recommendations: [
          "🚨 مراجعه فوری به درمانگر متخصص تروما",
          "درمان Trauma-focused CBT (CPT یا PE) - درمان اصلی",
          "EMDR (حرکت چشم و پردازش مجدد) - بسیار مؤثر برای PTSD",
          "دارودرمانی (SSRI) در صورت نیاز و با تجویز پزشک",
          "گروه حمایتی برای بازماندگان تروما",
          "ایجاد سیستم حمایتی قوی",
          "یادگیری تکنیک‌های مدیریت بحران",
          "صبر: بازیابی زمان می‌برد اما ممکن است - 60-80% افراد بهبود می‌یابند",
          "در صورت وجود افکار خودکشی، تماس فوری با خط بحران یا اورژانس"
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
    const maxScore = 80; // 20 questions * 4 points each

    const chartData = {
      labels: ["تجربه مجدد", "اجتناب", "شناخت/خلق", "برانگیختگی", "نمره کل"],
      datasets: [
        {
          label: "نمرات خوشه‌ها",
          data: [
            scores.intrusion,
            scores.avoidance,
            scores.cognition_mood,
            scores.arousal,
            scores.totalScore
          ],
          backgroundColor: [
            "rgba(239, 68, 68, 0.5)",
            "rgba(249, 115, 22, 0.5)",
            "rgba(234, 179, 8, 0.5)",
            "rgba(168, 85, 247, 0.5)",
            interpretation.color + "B3"
          ],
          borderColor: [
            "rgb(239, 68, 68)",
            "rgb(249, 115, 22)",
            "rgb(234, 179, 8)",
            "rgb(168, 85, 247)",
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
          text: "علائم استرس پس از سانحه (PTSD)",
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
                <FaExclamationTriangle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج علائم PTSD</h1>
                <p className="text-secondaryTextColor">Post-Traumatic Stress Disorder Symptoms</p>
              </div>
            </div>

            {scores.totalScore >= 31 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار</h4>
                <p className="text-sm text-red-300">نمره شما نشان‌دهنده احتمال وجود PTSD است. ارزیابی تخصصی توصیه می‌شود.</p>
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار خوشه‌ها</h3>
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
              <FaExclamationTriangle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">علائم استرس پس از سانحه (PTSD)</h1>
              <p className="text-secondaryTextColor">در ماه گذشته، چقدر این مشکلات شما را آزار دادند:</p>
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