"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("empathy");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "وقتی کسی ناراحت است، متوجه می‌شوم",
  "احساسات دیگران برایم مهم است",
  "می‌توانم خودم را جای دیگران بگذارم",
  "وقتی کسی گریه می‌کند، من هم تحت تأثیر قرار می‌گیرم",
  "به راحتی دیدگاه دیگران را درک می‌کنم",
  "در فیلم‌های غمگین گریه می‌کنم",
  "سعی می‌کنم همه جوانب را ببینم قبل از قضاوت",
  "با دیدن درد دیگران ناراحت می‌شوم",
  "به احساسات دیگران توجه می‌کنم",
  "دلم برای مظلومان می‌سوزد",
  "می‌فهمم چرا مردم کارهایی می‌کنند",
  "احساسات دیگران مرا تحت تأثیر قرار می‌دهد",
  "وقتی کسی تنها است، متوجه می‌شوم",
  "با دیدن شادی دیگران خوشحال می‌شوم",
  "می‌توانم انگیزه‌های مردم را بفهمم",
  "دردهای دیگران را حس می‌کنم",
  "در درک احساسات دیگران مهارت دارم",
  "وقتی کسی ناراحت است، من هم ناراحت می‌شوم",
  "به نیازهای غیرگفته دیگران پی می‌برم",
  "به راحتی با احساسات دیگران همراه می‌شوم"
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
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
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
    const maxScore = 100;
    const percentage = (score / maxScore) * 100;
    
    if (percentage < 40) {
      return {
        level: "همدلی پایین",
        color: "#ef4444",
        desc: "توانایی درک و همدلی با احساسات دیگران در شما پایین است.",
        details: "شما ممکن است در درک احساسات دیگران و قرار دادن خود در جایگاه آنها مشکل داشته باشید. این می‌تواند بر روابط اجتماعی و حرفه‌ای شما تأثیر بگذارد.",
        strengths: [],
        recommendations: [
          "**گوش دادن فعال**: تمرین گوش دادن واقعی به دیگران",
          "**سوال پرسیدن**: پرسیدن سوالات برای درک بهتر",
          "**توجه به زبان بدن**: توجه به نشانه‌های غیرکلامی",
          "**تمرین قرار دادن خود در جای دیگران**: تصور کردن خود در موقعیت دیگران",
          "**درک احساسات خود**: ابتدا درک احساسات خود برای درک دیگران",
          "**کتاب‌های روانشناسی**: خواندن درباره همدلی و مهارت‌های اجتماعی"
        ]
      };
    } else if (percentage < 60) {
      return {
        level: "همدلی متوسط",
        color: "#eab308",
        desc: "توانایی همدلی شما در سطح متوسط است. می‌توانید احساسات دیگران را تا حدی درک کنید اما فضای بهبود وجود دارد.",
        details: "شما تا حدی می‌توانید با دیگران همدلی کنید اما ممکن است در برخی موقعیت‌ها دشواری داشته باشید.",
        strengths: [
          "برخی مهارت‌های همدلی",
          "درک نسبی احساسات دیگران"
        ],
        recommendations: [
          "**تقویت مهارت‌های ارتباطی**: بهبود ارتباط با دیگران",
          "**تمرین همدلی**: تمرین منظم همدلی در موقعیت‌های مختلف",
          "**توجه بیشتر**: توجه بیشتر به احساسات و نیازهای دیگران",
          "**بازخورد گرفتن**: درخواست بازخورد از دیگران"
        ]
      };
    } else {
      return {
        level: "همدلی بالا",
        color: "#22c55e",
        desc: "توانایی همدلی شما بالا است. شما به خوبی می‌توانید احساسات دیگران را درک کنید و با آنها همدلی کنید.",
        details: "شما توانایی خوبی در درک احساسات دیگران دارید و می‌توانید خود را در جایگاه آنها قرار دهید. این مهارت می‌تواند روابط شما را تقویت کند.",
        strengths: [
          "درک عمیق احساسات دیگران",
          "توانایی قرار دادن خود در جای دیگران",
          "گوش دادن فعال",
          "ارتباط موثر",
          "حساسیت به نیازهای دیگران"
        ],
        recommendations: [
          "**حفظ این قدرت**: ادامه تمرین همدلی",
          "**استفاده مثبت**: استفاده از همدلی برای کمک به دیگران",
          "**مرزهای سالم**: حفظ مرزهای سالم در روابط",
          "**خودمراقبتی**: توجه به سلامت خود هنگام همدلی با دیگران"
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
    const maxScore = questions.length * Math.max(...options.map(o => o.value));

    const chartData = {
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'نمره تست',
        data: [score, maxScore * 0.33, maxScore * 0.66, maxScore],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست همدلی (Empathy)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.details}</p>
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
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره همدلی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره همدلی</h4>
              <p className="text-sm text-blue-300">
                همدلی توانایی درک و تجربه احساسات دیگران است. همدلی شامل سه نوع است: همدلی شناختی (درک دیدگاه دیگران)، 
                همدلی عاطفی (احساس احساسات دیگران)، و همدلی دلسوزانه (انگیزه برای کمک). همدلی بالا می‌تواند روابط را تقویت کند 
                اما باید مرزهای سالم را نیز حفظ کرد.
              </p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست همدلی (Empathy)</h1>
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
            >{questions[currentQuestion]}</h3>
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