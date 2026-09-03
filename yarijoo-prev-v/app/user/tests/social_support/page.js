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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("social_support");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "فرد خاصی در زندگی‌ام هست که واقعاً به من اهمیت می‌دهد.", subscale: "SignificantOther" },
    { text: "وقتی مشکلی دارم، یک فرد بسیار نزدیک برای صحبت دارم.", subscale: "SignificantOther" },
    { text: "خانواده‌ام واقعاً به احساسات و دیدگاه‌هایم توجه می‌کنند.", subscale: "Family" },
    { text: "می‌توانم درباره مشکلاتم با خانواده‌ام صحبت کنم.", subscale: "Family" },
    { text: "یک نفر هست که در شادی و غم کنار من می‌ماند.", subscale: "SignificantOther" },
    { text: "دوستانم واقعاً تلاش می‌کنند به من کمک کنند.", subscale: "Friends" },
    { text: "هر زمان نیاز داشته باشم، دوستانم در دسترس‌اند.", subscale: "Friends" },
    { text: "خانواده‌ام می‌توانند به من در تصمیم‌های مهم کمک کنند.", subscale: "Family" },
    { text: "دوستان قابل‌اعتمادی دارم که با آنها حرف بزنم.", subscale: "Friends" },
    { text: "یک فرد خاص دارم که می‌توانم روی حمایت او حساب کنم.", subscale: "SignificantOther" },
    { text: "خانواده‌ام سعی می‌کنند نیازهایم را برآورده کنند.", subscale: "Family" },
    { text: "وقتی احساس ناراحتی می‌کنم، دوستانم مرا درک می‌کنند.", subscale: "Friends" }
  ]

  const options = [
  {
    "value": 1,
    "label": "کاملاً مخالفم"
  },
  {
    "value": 2,
    "label": "خیلی مخالفم"
  },
  {
    "value": 3,
    "label": "مخالفم"
  },
  {
    "value": 4,
    "label": "نه موافق نه مخالف"
  },
  {
    "value": 5,
    "label": "موافقم"
  },
  {
    "value": 6,
    "label": "خیلی موافقم"
  },
  {
    "value": 7,
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
    setAnswers({ ...answers, [currentQuestion]: { value, subscale: q.subscale } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const family = [2, 3, 7, 10].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const friends = [5, 6, 8, 11].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const significantOther = [0, 1, 4, 9].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    
    const familyMean = family / 4;
    const friendsMean = friends / 4;
    const significantOtherMean = significantOther / 4;
    const totalMean = (familyMean + friendsMean + significantOtherMean) / 3;
    
    return { family, friends, significantOther, familyMean, friendsMean, significantOtherMean, totalMean };
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


  const getInterpretation = (mean) => {
    if (mean >= 5.01) {
      return {
        level: "حمایت بالا",
        color: "#22c55e",
        desc: "شبکه حمایتی گسترده و پایدار",
        details: "شما از حمایت اجتماعی قوی و قابل اعتماد برخوردار هستید و این شبکه می‌تواند تاب‌آوری شما را افزایش دهد.",
        strengths: [
          "روابط نزدیک و قابل اعتماد",
          "دسترسی سریع به کمک عاطفی و عملی",
          "احساس تعلق و امنیت اجتماعی"
        ],
        recommendations: [
          "حفظ و قدردانی از شبکه حمایتی موجود",
          "کمک به دیگران برای ایجاد روابط حمایتی",
          "گسترش این حمایت به حوزه‌های حرفه‌ای یا تحصیلی"
        ]
      };
    }
    if (mean >= 3.01) {
      return {
        level: "حمایت متوسط",
        color: "#eab308",
        desc: "برخی منابع حمایتی فعال",
        details: "شما از سطح قابل قبولی از حمایت برخوردارید اما بهبود آن می‌تواند احساس امنیت بیشتری ایجاد کند.",
        strengths: [
          "وجود چند رابطه قابل اتکا",
          "توانایی درخواست کمک در برخی شرایط",
          "آگاهی از اهمیت شبکه حمایتی"
        ],
        recommendations: [
          "تقویت کیفیت رابطه با خانواده یا دوستان کلیدی",
          "گسترش دایره روابط حمایتی (گروه‌های علاقه‌مندی، همکاران)",
          "تمرین مهارت درخواست کمک و بیان نیازها"
        ]
      };
    }
    return {
      level: "حمایت پایین",
      color: "#ef4444",
      desc: "نیاز فوری به تقویت شبکه حمایتی",
      details: "حمایت اجتماعی شما محدود است و ممکن است در شرایط دشوار احساس تنهایی یا فرسودگی کنید.",
      strengths: [
        "تمایل به بهبود روابط",
        "آگاهی از اهمیت حمایت اجتماعی"
      ],
      recommendations: [
        "شناسایی افراد قابل اعتماد برای شروع ارتباط عمیق‌تر",
        "عضویت در گروه‌های حمایتی یا مشاوره‌ای",
        "تقویت مهارت‌های ارتباطی و تعیین حدود سالم",
        "استفاده از خدمات تخصصی در صورت نیاز"
      ]
    };
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
    const interpretation = getInterpretation(scores.totalMean);

    const chartData = {
      labels: ['خانواده', 'دوستان', 'فرد خاص'],
      datasets: [{
        label: 'میانگین از 7',
        data: [scores.familyMean, scores.friendsMean, scores.significantOtherMean],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(168, 85, 247, 0.6)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس حمایت اجتماعی (MSPSS)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح حمایت اجتماعی</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            {interpretation.strengths && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت شبکه حمایتی</h3>
                <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                  {interpretation.strengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">خانواده</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: "#22c55e" }}>{scores.familyMean.toFixed(2)}</div>
                <div className="text-xs text-secondaryTextColor">میانگین از 7</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">دوستان</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: "#3b82f6" }}>{scores.friendsMean.toFixed(2)}</div>
                <div className="text-xs text-secondaryTextColor">میانگین از 7</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">شریک عاطفی</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: "#a855f7" }}>{scores.significantOtherMean.toFixed(2)}</div>
                <div className="text-xs text-secondaryTextColor">میانگین از 7</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار مقایسه زیرمقیاس‌ها</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'میانگین نمرات زیرمقیاس‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 7, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {scores.totalMean < 5 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">💡 توصیه</h4>
                <p className="text-sm text-yellow-300">تقویت روابط اجتماعی و ایجاد شبکه حمایتی قوی‌تر می‌تواند سلامت روانی شما را بهبود بخشد.</p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره MSPSS</h4>
              <p className="text-sm text-blue-300">
                مقیاس چندبعدی حمایت اجتماعی ادراک شده (MSPSS) یک ابزار 12 سوالی برای ارزیابی حمایت اجتماعی از سه منبع است: خانواده، دوستان و شریک عاطفی.
                هر زیرمقیاس از 1 تا 7 نمره‌دهی می‌شود و میانگین محاسبه می‌شود.
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
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس حمایت اجتماعی (MSPSS)</h1>
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
            >{questions[currentQuestion].text || questions[currentQuestion]}</h3>
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