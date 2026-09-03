"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("decision_making");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  { text: "قبل از تصمیم، همه گزینه‌ها را بررسی می‌کنم", type: "rational" },
  { text: "تصمیمات منطقی و مبتنی بر اطلاعات می‌گیرم", type: "rational" },
  { text: "زمان می‌گذارم برای تحقیق", type: "rational" },
  { text: "بر اساس احساس تصمیم می‌گیرم", type: "intuitive" },
  { text: "به شهود خود اعتماد دارم", type: "intuitive" },
  { text: "احساس درونی‌ام راهنمای من است", type: "intuitive" },
  { text: "سریع تصمیم می‌گیرم", type: "spontaneous" },
  { text: "بدون فکر زیاد عمل می‌کنم", type: "spontaneous" },
  { text: "تصمیمات آنی می‌گیرم", type: "spontaneous" },
  { text: "تصمیم‌گیری را به تعویق می‌اندازم", type: "avoidant" },
  { text: "از تصمیم‌گیری اجتناب می‌کنم", type: "avoidant" },
  { text: "امیدوارم مشکل خودبه‌خود حل شود", type: "avoidant" },
  { text: "به دیگران اجازه می‌دهم تصمیم بگیرند", type: "dependent" },
  { text: "از دیگران کمک می‌خواهم", type: "dependent" },
  { text: "نیاز به تایید دارم", type: "dependent" }
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
    const q = questions[currentQuestion];
    setAnswers({ ...answers, [currentQuestion]: { value, type: q.type } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };
  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        try {
          const scores = calculateScores();
          const totalScore = scores.totalScore || scores.total_score || Object.values(scores).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
          const interpretation = { level: 'متوسط', color: '#eab308', desc: '' };
          
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => { const answer = answers[idx]; if (typeof answer === 'object' && answer.value !== undefined) return answer.value; return answer !== undefined ? answer : 0; });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: totalScore,
            total_score: totalScore,
            level: interpretation.level || interpretation.level || 'متوسط',
            interpretation: interpretation,
            scores: scores,
          });
          
          if (saved && saved.success) {
            setIsCompleted(true);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, hasResult, answers, questions, saveResult]);



  const calculateScores = () => {
    const styles = { rational: 0, intuitive: 0, spontaneous: 0, avoidant: 0, dependent: 0 };
    questions.forEach((q, index) => {
      if (answers[index]) {
        styles[q.type] += answers[index].value || 0;
      }
    });
    return styles;
  };

  const getDominantStyle = (scores) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const getStyleInfo = (style) => {
    const styles = {
      rational: {
        level: "منطقی",
        color: "#22c55e",
        desc: "شما سبک تصمیم‌گیری منطقی دارید. بر اساس اطلاعات و تحلیل تصمیم می‌گیرید.",
        details: "شما قبل از تصمیم‌گیری، همه گزینه‌ها را بررسی می‌کنید و بر اساس اطلاعات و تحلیل تصمیم می‌گیرید. این رویکرد برای تصمیم‌های مهم بسیار مؤثر است.",
        strengths: ["تحلیل دقیق", "تصمیمات منطقی", "کاهش ریسک", "اطمینان بالا"],
        recommendations: [
          "**تعادل**: ترکیب با شهود برای تصمیمات سریع",
          "**زمان**: تعادل بین تحلیل و عمل",
          "**تصمیمات سریع**: یادگیری تصمیم‌گیری سریع‌تر در موارد فوری"
        ]
      },
      intuitive: {
        level: "شهودی",
        color: "#3b82f6",
        desc: "شما سبک تصمیم‌گیری شهودی دارید. بر اساس احساس درونی تصمیم می‌گیرید.",
        details: "شما به احساس درونی و شهود خود اعتماد دارید. این رویکرد برای موقعیت‌هایی که زمان کافی برای تحلیل ندارید مفید است.",
        strengths: ["تصمیمات سریع", "اعتماد به خود", "انعطاف‌پذیری"],
        recommendations: [
          "**ترکیب**: افزودن تحلیل منطقی برای تصمیمات مهم",
          "**اعتماد**: ادامه اعتماد به شهود در موقعیت‌های مناسب",
          "**تعادل**: استفاده از ترکیب شهود و منطق"
        ]
      },
      spontaneous: {
        level: "تکانشی",
        color: "#ef4444",
        desc: "شما تمایل به تصمیم‌گیری تکانشی دارید. نیاز به تفکر بیشتر دارید.",
        details: "شما تمایل دارید سریع و بدون فکر زیاد تصمیم بگیرید. این می‌تواند منجر به اشتباهات شود.",
        strengths: [],
        recommendations: [
          "**کاهش سرعت**: کمی مکث قبل از تصمیم",
          "**تحلیل**: بررسی پیامدهای احتمالی",
          "**یادگیری**: یادگیری تکنیک‌های تصمیم‌گیری بهتر",
          "**فهرست‌سازی**: نوشتن مزایا و معایب هر گزینه",
          "**مشورت**: گرفتن نظر دیگران قبل از تصمیم"
        ]
      },
      avoidant: {
        level: "اجتنابی",
        color: "#f59e0b",
        desc: "شما تمایل به اجتناب از تصمیم‌گیری دارید. نیاز به رویارویی دارید.",
        details: "شما تصمیم‌گیری را به تعویق می‌اندازید یا از آن اجتناب می‌کنید. این می‌تواند مشکلات را پیچیده‌تر کند.",
        strengths: [],
        recommendations: [
          "**رویارویی**: یادگیری رویارویی با تصمیم‌ها",
          "**تقسیم**: تقسیم تصمیمات بزرگ به کوچک",
          "**حمایت**: درخواست کمک در صورت نیاز",
          "**زمان‌بندی**: تعیین مهلت مشخص برای تصمیم‌گیری",
          "**پیامدها**: بررسی پیامدهای عدم تصمیم‌گیری"
        ]
      },
      dependent: {
        level: "وابسته",
        color: "#eab308",
        desc: "شما تمایل دارید تصمیم‌گیری را به دیگران واگذار کنید. نیاز به استقلال دارید.",
        details: "شما ترجیح می‌دهید دیگران تصمیم بگیرند یا به تایید دیگران نیاز دارید. این می‌تواند استقلال شما را محدود کند.",
        strengths: ["دریافت نظر دیگران", "همکاری"],
        recommendations: [
          "**استقلال**: افزایش اعتماد به خود برای تصمیم‌گیری",
          "**تعادل**: ترکیب مشورت با تصمیم مستقل",
          "**اعتماد**: افزایش اعتماد به قضاوت خود",
          "**تجربه**: اعتماد به تجربه و دانش خود",
          "**تمرین**: تمرین تصمیم‌گیری مستقل در مسائل کوچک"
        ]
      }
    };
    return styles[style] || styles.rational;
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
    const interpretation = getStyleInfo(dominantStyle);
    const maxScore = 75;

    const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
    const chartData = {
      labels: ['منطقی', 'شهودی', 'تکانشی', 'اجتنابی', 'وابسته'],
      datasets: [{
        label: 'نمرات سبک‌های تصمیم‌گیری',
        data: [scores.rational, scores.intuitive, scores.spontaneous, scores.avoidant, scores.dependent],
        backgroundColor: [
          '#22c55e',
          '#3b82f6',
          '#ef4444',
          '#f59e0b',
          '#eab308'
        ],
        borderColor: [
          '#16a34a',
          '#2563eb',
          '#dc2626',
          '#d97706',
          '#ca8a04'
        ],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک تصمیم‌گیری</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک غالب تصمیم‌گیری</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(scores).map(([style, score]) => {
                const styleInfo = getStyleInfo(style);
                return (
                  <div key={style} className="bg-darkThemeColor rounded-2xl p-4">
                    <h4 className="text-xs font-medium text-secondaryTextColor mb-2">{styleInfo.level}</h4>
                    <div className="text-xl font-bold mb-1" style={{ color: styleInfo.color }}>{score}</div>
                    <div className="text-xs text-secondaryTextColor">از 15</div>
                  </div>
                );
              })}
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
                {Array.isArray(interpretation.recommendations) ? interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                )) : (
                  <li className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: interpretation.recommendations.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار سبک‌های تصمیم‌گیری</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'مقایسه سبک‌های تصمیم‌گیری', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 15, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست سبک تصمیم‌گیری</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option) => (
                <button key={option.value} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all">
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