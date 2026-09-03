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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("conflict_style");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "سعی می‌کنم خواسته خودم را به دست بیاورم", type: "competing" },
    { text: "برای پیروزی فشار می‌آورم", type: "competing" },
    { text: "از قدرت و موقعیتم استفاده می‌کنم", type: "competing" },
    { text: "تسلیم می‌شوم تا رابطه حفظ شود", type: "accommodating" },
    { text: "خواسته طرف مقابل را می‌پذیرم", type: "accommodating" },
    { text: "از حق خود می‌گذرم", type: "accommodating" },
    { text: "از بحث اجتناب می‌کنم", type: "avoiding" },
    { text: "موضوع را نادیده می‌گیرم", type: "avoiding" },
    { text: "از موقعیت دور می‌شوم", type: "avoiding" },
    { text: "راه میانه پیدا می‌کنم", type: "compromising" },
    { text: "هر دو طرف کمی عقب‌نشینی کنیم", type: "compromising" },
    { text: "توافق سریع می‌جویم", type: "compromising" },
    { text: "به دنبال راه‌حل برد-برد هستم", type: "collaborating" },
    { text: "نیازهای هر دو طرف را در نظر می‌گیرم", type: "collaborating" },
    { text: "راه‌حل خلاقانه می‌جویم", type: "collaborating" },
    { text: "مشکل را از زوایای مختلف می‌بینیم", type: "collaborating" },
    { text: "با هم کار می‌کنیم تا بهترین راه را پیدا کنیم", type: "collaborating" },
    { text: "زمان می‌گذارم تا راه‌حل کامل پیدا کنیم", type: "collaborating" }
  ]

  const options = [
  {
    "value": 1,
    "label": "هرگز"
  },
  {
    "value": 2,
    "label": "به ندرت"
  },
  {
    "value": 3,
    "label": "گاهی"
  },
  {
    "value": 4,
    "label": "اغلب"
  },
  {
    "value": 5,
    "label": "همیشه"
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
    const competing = [0, 1, 2].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const accommodating = [3, 4, 5].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const avoiding = [6, 7, 8].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const compromising = [9, 10, 11].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const collaborating = [12, 13, 14, 15, 16, 17].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    
    return { competing, accommodating, avoiding, compromising, collaborating };
  };

  const getDominantStyle = (scores) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const getStyleInfo = (style) => {
    const styles = {
      competing: {
        title: "رقابتی (Competing)",
        persian: "رقابتی",
        color: "#dc2626",
        desc: "سبک قدرت‌محور - برنده شدن مهم است.",
        details: "شما سبک حل تعارض رقابتی دارید. از قدرت و موقعیت خود برای رسیدن به خواسته‌هایتان استفاده می‌کنید. این سبک در مواقع بحرانی یا تصمیمات فوری مفید است اما می‌تواند روابط را آسیب برساند.",
        strengths: ["تصمیم‌گیری سریع", "قاطعیت", "حفاظت از منافع"],
        recommendations: ["**استفاده انتخابی**: استفاده از این سبک در موقعیت‌های بحرانی یا فوری", "**یادگیری سبک‌های دیگر**: گسترش مهارت‌ها با یادگیری سبک همکاری", "**تمرین همکاری**: تمرین سبک همکاری در روابط مهم و بلندمدت"]
      },
      accommodating: {
        title: "سازگار (Accommodating)",
        persian: "سازگار",
        color: "#eab308",
        desc: "اولویت به رابطه - از نیازهای خود می‌گذرید.",
        details: "شما سبک سازگار دارید. برای حفظ رابطه، از خواسته‌های خود می‌گذرید. این سبک زمانی مفید است که موضوع کم‌اهمیت است یا رابطه مهم‌تر از مسئله است.",
        strengths: ["حفظ روابط", "هماهنگی", "دیپلماسی"],
        recommendations: ["**یادگیری قاطعیت**: یادگیری بیان نیازها و خواسته‌های خود", "**بیان نیازها**: تمرین بیان مستقیم نیازها و احساسات", "**تعادل**: ایجاد تعادل بین نیازهای خود و حفظ روابط"]
      },
      avoiding: {
        title: "اجتنابی (Avoiding)",
        persian: "اجتنابی",
        color: "#f97316",
        desc: "اجتناب از تعارض - موضوع را نادیده می‌گیرید.",
        details: "شما سبک اجتنابی دارید. از مواجهه با تعارض اجتناب می‌کنید. این سبک برای مسائل جزئی یا زمانی که نیاز به زمان دارید مناسب است اما ممکن است مشکلات را تشدید کند.",
        strengths: ["اجتناب از درگیری غیرضروری", "خریدن زمان برای فکر کردن"],
        recommendations: ["**مواجهه با مسائل مهم**: یادگیری رویارویی مستقیم با مسائل مهم", "**یادگیری حل تعارض**: آموزش مهارت‌های حل تعارض و مذاکره", "**بیان نگرانی‌ها**: تمرین بیان صریح نگرانی‌ها و نیازها"]
      },
      compromising: {
        title: "مصالحه (Compromising)",
        persian: "مصالحه",
        color: "#3b82f6",
        desc: "راه میانه - هر دو طرف کمی عقب‌نشینی می‌کنند.",
        details: "شما سبک مصالحه دارید. راه میانه می‌جویید و هر دو طرف کمی از خواسته‌های خود می‌گذرند. این سبک برای راه‌حل‌های سریع مفید است.",
        strengths: ["راه‌حل سریع", "تعادل نسبی", "عملگرایی"],
        recommendations: ["**انتخاب موقعیت‌**: استفاده از سبک همکاری برای مسائل مهم و پیچیده", "**وقت گذاشتن**: اختصاص زمان کافی برای مسائل مهم و بلندمدت", "**توسعه مهارت همکاری**: یادگیری و تمرین سبک همکاری برای راه‌حل‌های بهتر"]
      },
      collaborating: {
        title: "همکاری (Collaborating) - ایده‌آل",
        persian: "همکاری",
        color: "#22c55e",
        desc: "راه‌حل برد-برد - نیازهای هر دو طرف برآورده می‌شود.",
        details: "شما سبک همکاری دارید که ایده‌آل است. به دنبال راه‌حل‌های خلاقانه‌ای هستید که نیازهای همه را برآورده کند. این سبک برای مسائل مهم و روابط پایدار بهترین است.",
        strengths: ["راه‌حل کامل", "تقویت روابط", "رضایت همه", "خلاقیت"],
        recommendations: ["**حفظ این سبک**: ادامه استفاده از سبک همکاری که ایده‌آل است", "**انتخاب موقعیت‌**: استفاده از این سبک برای مسائل مهم و روابط پایدار", "**الگو بودن**: الهام بخشیدن به دیگران و کمک به یادگیری این سبک"]
      }
    };
    return styles[style] || styles.collaborating;
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
    const styleInfo = getStyleInfo(dominantStyle);

    const chartData = {
      labels: ['رقابتی', 'سازگار', 'اجتنابی', 'مصالحه', 'همکاری'],
      datasets: [{
        label: 'نمرات سبک‌های حل تعارض',
        data: [
          scores.competing,
          scores.accommodating,
          scores.avoiding,
          scores.compromising,
          scores.collaborating
        ],
        backgroundColor: [
          '#dc2626',
          '#eab308',
          '#f97316',
          '#3b82f6',
          '#22c55e'
        ],
        borderColor: [
          '#b91c1c',
          '#ca8a04',
          '#ea580c',
          '#2563eb',
          '#16a34a'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک حل تعارض</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک حل تعارض اصلی شما</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: styleInfo.color }}>{styleInfo.persian}</div>
              <p className="text-secondaryTextColor mt-2">{styleInfo.desc}</p>
              <p className="text-secondaryTextColor mt-2 text-sm">{styleInfo.details}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">رقابتی</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#dc2626" }}>{scores.competing}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">سازگار</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#eab308" }}>{scores.accommodating}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">اجتنابی</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#f97316" }}>{scores.avoiding}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">مصالحه</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#3b82f6" }}>{scores.compromising}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">همکاری</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#22c55e" }}>{scores.collaborating}</div>
                <div className="text-xs text-secondaryTextColor">از 30</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار مقایسه سبک‌ها</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'نمرات 5 سبک حل تعارض', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 30, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {styleInfo.strengths && styleInfo.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {styleInfo.strengths.map((strength, index) => (
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
                {styleInfo.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست سبک حل تعارض</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion].text || questions[currentQuestion]}</h3>
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