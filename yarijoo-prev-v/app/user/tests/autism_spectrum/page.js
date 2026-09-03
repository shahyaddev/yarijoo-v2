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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("autism_spectrum");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "ترجیح می‌دهم کارها را با دیگران انجام دهم تا تنها",
  "ترجیح می‌دهم کارها را همیشه به یک شکل انجام دهم",
  "تصور کردن چیزها برایم آسان است",
  "اغلب آنقدر در چیزی غرق می‌شوم که چیزهای دیگر را نمی‌بینم",
  "صداهای کوچک که دیگران متوجه نیستند، مرا آزار می‌دهد",
  "معمولاً به جزئیات کوچک توجه می‌کنم",
  "می‌فهمم که دیگران چه احساسی دارند",
  "وقتی داستان می‌خوانم، شخصیت‌ها را تصور می‌کنم",
  "به تاریخ‌ها و اعداد علاقه دارم",
  "در موقعیت‌های اجتماعی به راحتی می‌فهمم چه باید بگویم",
  "از موقعیت‌های اجتماعی لذت می‌برم",
  "سخت است منظور دیگران را بفهمم",
  "دوست دارم اطلاعات جدید جمع کنم",
  "وقتی داستان می‌خوانم، دشوار است انگیزه شخصیت را بفهمم",
  "به بازی‌های تخیلی علاقه‌ای ندارم",
  "می‌توانم از لحن صدا بفهمم دیگران چه احساسی دارند",
  "سازگاری با تغییرات برایم سخت است",
  "می‌دانم چطور بفهمم کسی به گفتگوی من علاقه دارد یا نه",
  "بازی‌های \"وانمود کردن\" برایم دشوار است",
  "می‌توانم به سرعت بفهمم کسی چه فکر یا احساسی دارد",
  "دوست دارم درباره موضوعات خاص اطلاعات زیادی بدانم",
  "دوست دارم به افراد جدید سر بزنم",
  "از جمع‌آوری اطلاعات درباره دسته‌بندی‌ها لذت می‌برم",
  "تشخیص اینکه کسی بی‌ادب است برایم سخت است",
  "می‌توانم به راحتی به ذهن دیگران فکر کنم",
  "در گفتگوها می‌دانم کی نوبت من است",
  "دوست دارم درباره احساسات صحبت کنم",
  "می‌فهمم که کسی شوخی می‌کند یا جدی است",
  "تشخیص اینکه کسی از گفتگو خسته شده برایم دشوار است",
  "در موقعیت اجتماعی اغلب اشتباه می‌کنم",
  "الگوها را به راحتی می‌بینم",
  "مردم اغلب رفتارم را بی‌ادبی می‌دانند",
  "می‌توانم از چهره بفهمم کسی چه فکری می‌کند",
  "نمی‌دانم چطور گفتگو را ادامه دهم",
  "به راحتی می‌توانم کارهای چند نفره انجام دهم",
  "وقتی صحبت می‌کنم، برای دیگران سخت است وارد گفتگو شوند",
  "از فعالیت‌های تکراری لذت می‌برم",
  "اغلب آخرین کسی هستم که شوخی را می‌فهمم",
  "می‌توانم از نشانه‌های ظریف بفهمم کسی علاقه‌ای ندارد",
  "نمی‌دانم در موقعیت اجتماعی چطور رفتار کنم",
  "از یافتن الگوهای اطلاعات لذت می‌برم",
  "دوست دارم به موزه یا کتابخانه بروم",
  "ساختن داستان برایم آسان است",
  "بیشتر به اشیاء علاقه دارم تا مردم",
  "برنامه‌های دقیق می‌ریزم",
  "از رویدادهای اجتماعی لذت می‌برم",
  "تشخیص منظور افراد از گفته‌هایشان دشوار است",
  "کارهای جدید شروع کردن برایم سخت است",
  "دوست دارم مدام اطلاعات جدید جمع کنم",
  "در موقعیت اجتماعی می‌دانم چطور رفتار کنم"
        ]

  const options = [
  {
    "value": 1,
    "label": "کاملاً مخالفم"
  },
  {
    "value": 2,
    "label": "کمی مخالفم"
  },
  {
    "value": 3,
    "label": "کمی موافقم"
  },
  {
    "value": 4,
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
    const maxScore = 255;
    const percentage = (score / maxScore) * 100;
    
    if (percentage < 30) {
      return {
        level: "سطح پایین",
        color: "#22c55e",
        desc: "نمره شما نشان می‌دهد که در این زمینه وضعیت خوبی دارید و علائم کمی مشاهده می‌شود.",
        details: "بر اساس پاسخ‌های شما، به نظر می‌رسد که در این حوزه عملکرد مناسبی دارید. این یک نشانه مثبت است و نشان‌دهنده سلامت روانی خوب در این بعد می‌باشد. با این حال، مهم است که به حفظ این وضعیت ادامه دهید و در صورت بروز هرگونه تغییر، به آن توجه کنید.",
        strengths: [
          "عملکرد مناسب در این حوزه",
          "نشانه‌های سلامت روانی مطلوب",
          "توانایی مقابله با چالش‌های روزمره",
          "کیفیت زندگی خوب",
          "سازگاری مناسب با محیط"
],
        recommendations: [
          "ادامه شیوه زندگی فعلی و حفظ عادت‌های سالم",
          "توجه به علائم هشداردهنده و تغییرات احتمالی",
          "حفظ تعادل بین کار، استراحت و تفریح",
          "تقویت روابط اجتماعی و حمایت خانوادگی",
          "مراقبت منظم از سلامت جسمی و روانی"
]
      };

    } else {
      return {
        level: "سطح متوسط",
        color: "#eab308",
        desc: "نمره شما در محدوده متوسط قرار دارد.",
        details: "بر اساس پاسخ‌های شما، عملکرد شما در این حوزه در حد متوسط است.",
        strengths: [],
        recommendations: [
          "تمرین تکنیک‌های بهبود عملکرد",
          "مشاوره با متخصص برای ارزیابی دقیق‌تر",
          "برنامه‌ریزی برای بهبود",
          "حفظ انگیزه و تلاش مستمر"
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست AUTISM_SPECTRUM</h1>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست AUTISM_SPECTRUM</h1>
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