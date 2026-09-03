"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ciss");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  { text: "برنامه‌ریزی برای حل می‌کنم", style: "task" },
  { text: "بیشتر کار می‌کنم تا حل شود", style: "task" },
  { text: "با کسی که می‌تواند کمک کند صحبت می‌کنم", style: "emotion" },
  { text: "احساساتم را بیان می‌کنم", style: "emotion" },
  { text: "سعی می‌کنم به چیز دیگری فکر کنم", style: "avoidance" },
  { text: "تلویزیون تماشا می‌کنم", style: "avoidance" },
  { text: "راه‌حل پیدا می‌کنم", style: "task" },
  { text: "گام‌های لازم را برمی‌دارم", style: "task" },
  { text: "از دیگران حمایت می‌خواهم", style: "emotion" },
  { text: "درباره احساساتم می‌نویسم", style: "emotion" },
  { text: "خرید می‌کنم", style: "avoidance" },
  { text: "خواب می‌روم", style: "avoidance" },
  { text: "اولویت‌بندی می‌کنم", style: "task" },
  { text: "تمرکز روی حل می‌کنم", style: "task" },
  { text: "با دوستان وقت می‌گذرانم", style: "emotion" },
  { text: "سرگرمی پیدا می‌کنم", style: "avoidance" }
        ]

  const options = [
  {
    "value": 1,
    "label": "اصلاً"
  },
  {
    "value": 2,
    "label": "کمی"
  },
  {
    "value": 3,
    "label": "متوسط"
  },
  {
    "value": 4,
    "label": "زیاد"
  },
  {
    "value": 5,
    "label": "خیلی زیاد"
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
    let taskScore = 0;
    let emotionScore = 0;
    let avoidanceScore = 0;

    questions.forEach((q, index) => {
      const value = answers[index] || 0;
      if (q.style === "task") taskScore += value;
      else if (q.style === "emotion") emotionScore += value;
      else if (q.style === "avoidance") avoidanceScore += value;
    });

    return { taskScore, emotionScore, avoidanceScore };
  };

  const getDominantStyle = (taskScore, emotionScore, avoidanceScore) => {
    const maxScore = Math.max(taskScore, emotionScore, avoidanceScore);
    if (maxScore === taskScore) return "task";
    if (maxScore === emotionScore) return "emotion";
    return "avoidance";
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


  const getInterpretation = (style, taskScore, emotionScore, avoidanceScore) => {
    const styles = {
      task: {
        level: "مسئله‌محور (Task-Focused)",
        color: "#22c55e",
        desc: "سبک مقابله مسئله‌محور - مؤثرترین سبک برای استرس‌های قابل کنترل.",
        details: "شما تمایل دارید با تمرکز بر حل مسئله و اقدام مستقیم با استرس مقابله کنید. این سبک برای استرس‌های قابل کنترل بسیار مؤثر است.",
        strengths: ["برنامه‌ریزی", "اقدام مستقیم", "حل فعال مسئله", "احساس کنترل"],
        recommendations: [
          "**ادامه استفاده**: این سبک برای استرس‌های قابل کنترل عالی است",
          "**تقویت مهارت**: ادامه بهبود مهارت‌های حل مسئله",
          "**آموزش دیگران**: به اشتراک‌گذاری این مهارت‌ها"
        ]
      },
      emotion: {
        level: "هیجان‌محور (Emotion-Focused)",
        color: "#eab308",
        desc: "سبک مقابله هیجان‌محور - مفید برای پردازش احساسات.",
        details: "شما تمایل دارید با تمرکز بر احساسات و حمایت عاطفی با استرس مقابله کنید. این سبک برای استرس‌های غیرقابل کنترل و نیاز به پردازش عاطفی مفید است.",
        strengths: ["پردازش احساسات", "درخواست حمایت", "بیان عاطفی"],
        recommendations: [
          "**استفاده متعادل**: ترکیب با سبک مسئله‌محور",
          "**تعادل**: مراقب غرق شدن در احساسات باشید",
          "**کاربرد مناسب**: برای استرس‌های غیرقابل کنترل مناسب است"
        ]
      },
      avoidance: {
        level: "اجتنابی (Avoidance)",
        color: "#f97316",
        desc: "سبک مقابله اجتنابی - نیاز به بهبود و جایگزینی.",
        details: "شما تمایل دارید از استرس با اجتناب و حواس‌پرتی مقابله کنید. این سبک برای استرس‌های شدید کوتاه‌مدت ممکن است مفید باشد اما استفاده مزمن می‌تواند مشکل‌ساز باشد.",
        strengths: [],
        recommendations: [
          "**کاهش اجتناب**: یادگیری رویارویی با استرس",
          "**جایگزینی**: جایگزینی اجتناب با حل مسئله",
          "**تدریجی**: رویارویی تدریجی با استرس‌ها",
          "**حمایت**: کمک در رویارویی با مشکلات",
          "**CBT**: مشاوره برای تغییر الگوی اجتناب"
        ]
      }
    };

    return styles[style] || styles.task;
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
    const { taskScore, emotionScore, avoidanceScore } = calculateScores();
    const dominantStyle = getDominantStyle(taskScore, emotionScore, avoidanceScore);
    const interpretation = getInterpretation(dominantStyle, taskScore, emotionScore, avoidanceScore);

    const radarData = {
      labels: ['مسئله‌محور', 'هیجان‌محور', 'اجتنابی'],
      datasets: [{
        label: 'سبک‌های مقابله',
        data: [taskScore, emotionScore, avoidanceScore],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست CISS</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک غالب</h3>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">مسئله‌محور</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#22c55e' }}>{taskScore}</div>
                <div className="text-xs text-secondaryTextColor">از 30</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">هیجان‌محور</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#eab308' }}>{emotionScore}</div>
                <div className="text-xs text-secondaryTextColor">از 25</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اجتنابی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: '#f97316' }}>{avoidanceScore}</div>
                <div className="text-xs text-secondaryTextColor">از 25</div>
              </div>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
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
                {interpretation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار سبک‌های مقابله</h3>
              <div className="w-full h-80">
                <Radar data={radarData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 30,
                      ticks: { color: '#9ca3af', stepSize: 5 },
                      grid: { color: '#374151' },
                      pointLabels: { color: '#e5e7eb' }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'سبک‌های مقابله با استرس', color: '#e5e7eb', font: { size: 16 } }
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست CISS</h1>
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
            >{questions[currentQuestion].text}</h3>
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