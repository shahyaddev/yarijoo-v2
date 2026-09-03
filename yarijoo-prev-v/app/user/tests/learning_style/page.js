"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("learning_style");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  { text: "با دیدن و تماشا یاد می‌گیرم", type: "visual" },
  { text: "نمودارها و تصاویر به من کمک می‌کند", type: "visual" },
  { text: "رنگ‌ها و طرح‌ها را به خاطر می‌سپارم", type: "visual" },
  { text: "ترجیح می‌دهم ببینم چطور کاری انجام می‌شود", type: "visual" },
  { text: "با شنیدن یاد می‌گیرم", type: "auditory" },
  { text: "توضیحات شفاهی به من کمک می‌کند", type: "auditory" },
  { text: "از ضبط صوتی استفاده می‌کنم", type: "auditory" },
  { text: "با بلند خواندن بهتر یاد می‌گیرم", type: "auditory" },
  { text: "با انجام دادن یاد می‌گیرم", type: "kinesthetic" },
  { text: "باید خودم امتحان کنم", type: "kinesthetic" },
  { text: "با حرکت و فعالیت بهتر یاد می‌گیرم", type: "kinesthetic" },
  { text: "عملی کار کردن را ترجیح می‌دهم", type: "kinesthetic" },
  { text: "با خواندن و نوشتن یاد می‌گیرم", type: "reading" },
  { text: "یادداشت‌برداری به من کمک می‌کند", type: "reading" },
  { text: "متن‌ها را دوست دارم", type: "reading" }
        ]

  const options = [
  {
    "value": 1,
    "label": "خیلی کم"
  },
  {
    "value": 2,
    "label": "کم"
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
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            if (typeof answer === 'object' && answer.value !== undefined) return answer.value;
            return answer !== undefined ? answer : 0;
          });

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
    const scores = { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 };
    questions.forEach((q, index) => {
      if (answers[index]) {
        scores[q.type] += answers[index].value || 0;
      }
    });
    return scores;
  };

  const getDominantStyle = (scores) => {
    const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic, scores.reading);
    if (maxScore === scores.visual) return "visual";
    if (maxScore === scores.auditory) return "auditory";
    if (maxScore === scores.kinesthetic) return "kinesthetic";
    return "reading";
  };

  const getStyleInfo = (style, scores) => {
    const styles = {
      visual: {
        title: "سبک یادگیری بصری",
        persian: "بصری",
        color: "#3b82f6",
        desc: "شما از طریق دیدن و مشاهده بهتر یاد می‌گیرید. نمودارها، تصاویر و فیلم‌ها برای شما مؤثر هستند.",
        details: "افراد با سبک یادگیری بصری از طریق دیدن بهتر یاد می‌گیرند. استفاده از نمودارها، تصاویر، رنگ‌ها و نمایش بصری برای شما بسیار مؤثر است.",
        strengths: ["درک تصویری عالی", "حافظه بصری قوی", "توانایی ترسیم و تجسم"],
        recommendations: [
          "**استفاده از نمودارها**: تبدیل متن به نمودار و نقشه ذهنی",
          "**رنگ‌بندی**: استفاده از رنگ‌های مختلف در یادداشت‌ها",
          "**فیلم و ویدیو**: تماشای ویدیوهای آموزشی",
          "**نقشه ذهنی**: استفاده از نقشه‌های ذهنی",
          "**تصاویر**: استفاده از تصاویر و دیاگرام"
        ]
      },
      auditory: {
        title: "سبک یادگیری شنیداری",
        persian: "شنیداری",
        color: "#22c55e",
        desc: "شما از طریق شنیدن بهتر یاد می‌گیرید. توضیحات شفاهی و صداها برای شما مؤثر هستند.",
        details: "افراد با سبک یادگیری شنیداری از طریق شنیدن بهتر یاد می‌گیرند. استفاده از توضیحات شفاهی، بحث و گفتگو برای شما بسیار مؤثر است.",
        strengths: ["گوش دادن خوب", "درک شفاهی عالی", "توانایی یادگیری از صدا"],
        recommendations: [
          "**ضبط صوتی**: ضبط کردن مطالب و گوش دادن",
          "**بحث و گفتگو**: مشارکت در بحث‌های گروهی",
          "**بلند خواندن**: بلند خواندن مطالب",
          "**پادکست**: گوش دادن به پادکست‌های آموزشی",
          "**توضیح دادن**: توضیح دادن مطالب برای دیگران"
        ]
      },
      kinesthetic: {
        title: "سبک یادگیری حرکتی-لمسی",
        persian: "حرکتی-لمسی",
        color: "#f59e0b",
        desc: "شما از طریق انجام دادن و حرکت بهتر یاد می‌گیرید. تجربه عملی برای شما مؤثر است.",
        details: "افراد با سبک یادگیری حرکتی-لمسی از طریق انجام دادن و تجربه عملی بهتر یاد می‌گیرند. استفاده از آزمایش، عملیات و تجربه مستقیم برای شما بسیار مؤثر است.",
        strengths: ["توانایی عملی عالی", "یادگیری از تجربه", "انجام فعالیت‌های فیزیکی"],
        recommendations: [
          "**تجربه عملی**: انجام آزمایش‌ها و پروژه‌ها",
          "**مدل‌سازی**: ساخت مدل‌ها و ماکت‌ها",
          "**فعالیت بدنی**: ترکیب یادگیری با حرکت",
          "**بازی و شبیه‌سازی**: استفاده از بازی‌های آموزشی",
          "**تمرین عملی**: تمرین و تکرار عملی"
        ]
      },
      reading: {
        title: "سبک یادگیری خواندن-نوشتن",
        persian: "خواندن-نوشتن",
        color: "#8b5cf6",
        desc: "شما از طریق خواندن و نوشتن بهتر یاد می‌گیرید. متن و یادداشت‌برداری برای شما مؤثر است.",
        details: "افراد با سبک یادگیری خواندن-نوشتن از طریق خواندن و نوشتن بهتر یاد می‌گیرند. استفاده از متن، یادداشت‌برداری و نوشتن برای شما بسیار مؤثر است.",
        strengths: ["خواندن عالی", "یادداشت‌برداری خوب", "توانایی نوشتن"],
        recommendations: [
          "**خواندن عمیق**: مطالعه دقیق متون",
          "**یادداشت‌برداری**: نوشتن خلاصه و یادداشت",
          "**فلش‌کارت**: استفاده از فلش‌کارت برای حفظ",
          "**نوشتن خلاصه**: خلاصه‌نویسی مطالب",
          "**مطالعه متنی**: تمرکز بر کتاب و مقاله"
        ]
      }
    };
    return styles[style] || styles.visual;
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
    const styleInfo = getStyleInfo(dominantStyle, scores);

    const radarData = {
      labels: ['بصری', 'شنیداری', 'حرکتی-لمسی', 'خواندن-نوشتن'],
      datasets: [{
        label: 'سبک‌های یادگیری',
        data: [scores.visual, scores.auditory, scores.kinesthetic, scores.reading],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک یادگیری</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک غالب یادگیری</h3>
              <div className="text-2xl font-bold mb-2" style={{ color: styleInfo.color }}>{styleInfo.title}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{styleInfo.desc}</div>
              <p className="text-sm text-secondaryTextColor">{styleInfo.details}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">بصری</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#3b82f6' }}>{scores.visual}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">شنیداری</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#22c55e' }}>{scores.auditory}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">حرکتی-لمسی</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#f59e0b' }}>{scores.kinesthetic}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">خواندن-نوشتن</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#8b5cf6' }}>{scores.reading}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
            </div>

            {styleInfo.strengths && styleInfo.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {styleInfo.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های یادگیری</h3>
              <ul className="space-y-3">
                {styleInfo.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار سبک‌های یادگیری</h3>
              <div className="w-full h-80">
                <Radar data={radarData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 20,
                      ticks: { color: '#9ca3af', stepSize: 5 },
                      grid: { color: '#374151' },
                      pointLabels: { color: '#e5e7eb' }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'سبک‌های یادگیری شما', color: '#e5e7eb', font: { size: 16 } }
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست LEARNING_STYLE</h1>
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