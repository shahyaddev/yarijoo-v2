"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBolt } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("adhd_symptoms");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "اشتباهات سهوی در جزئیات کارها دارید",
    "مشکل در حفظ توجه در کارها یا بازی دارید",
    "به نظر نمی‌رسد گوش می‌دهید که با شما صحبت می‌شود",
    "دستورالعمل‌ها را دنبال نمی‌کنید و کارها ناتمام می‌ماند",
    "مشکل در سازماندهی کارها و فعالیت‌ها دارید",
    "از کارهای نیازمند تلاش ذهنی مداوم اجتناب می‌کنید",
    "وسایل لازم (کلید، عینک، موبایل) را گم می‌کنید",
    "به راحتی با محرک‌های خارجی حواس‌تان پرت می‌شود",
    "در فعالیت‌های روزمره فراموش‌کار هستید",
    "دست یا پا را بی‌قرار تکان می‌دهید",
    "در موقعیت‌هایی که باید بنشینید، از جایتان بلند می‌شوید",
    "در موقعیت‌های آرام، احساس بی‌قراری می‌کنید",
    "مشکل در انجام آرام فعالیت‌های تفریحی دارید",
    "انگار همیشه \"در حال حرکت\" یا \"موتوری\" هستید",
    "زیاد حرف می‌زنید",
    "قبل از تمام شدن سوال، جواب می‌دهید",
    "مشکل در صبر کردن برای نوبت خود دارید",
    "فعالیت دیگران را قطع یا مزاحم می‌شوید"
  ];

  const options = [{value:0,label:"هرگز"},{value:1,label:"به ندرت"},{value:2,label:"گاهی"},{value:3,label:"اغلب"},{value:4,label:"خیلی زیاد"}];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({...answers,[currentQuestion]:value});
    if (currentQuestion<questions.length-1) setCurrentQuestion(currentQuestion+1);
    else setIsCompleted(true);
  };

  const calculateScore = () => Object.values(answers).reduce((sum,score)=>sum+score,0);

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
    const maxScore = 72;
    
    if (score <= 17) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "علائم ADHD در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که علائم ADHD در حد طبیعی است. شما در این زمینه وضعیت خوبی دارید و علائم قابل توجهی مشاهده نمی‌شود.",
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
    }
    if (score <= 23) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: "علائم خفیف ADHD مشاهده می‌شود.",
        details: "بر اساس پاسخ‌های شما، علائم خفیفی از ADHD مشاهده می‌شود. این علائم ممکن است گاهی بر عملکرد شما تأثیر بگذارند اما قابل مدیریت هستند.",
        strengths: [
          "برخی مهارت‌های مقابله",
          "آگاهی از مشکل",
          "عملکرد نسبی مناسب"
        ],
        recommendations: [
          "یادگیری راهکارهای سازماندهی و مدیریت زمان",
          "استفاده از ابزارهای کمکی مانند تقویم و یادآورها",
          "تقسیم کارها به بخش‌های کوچک‌تر",
          "ایجاد محیط کاری بدون حواس‌پرتی",
          "استفاده از تکنیک Pomodoro برای تمرکز",
          "مشاوره با روان‌شناس در صورت نیاز"
        ]
      };
    }
    if (score <= 29) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "سطح متوسط ADHD که نیاز به توجه دارد.",
        details: "علائم متوسط ADHD در شما مشاهده می‌شود که نیاز به توجه دارد. این علائم می‌توانند بر عملکرد تحصیلی، شغلی و زندگی روزمره شما تأثیر بگذارند.",
        strengths: [
          "شناسایی مشکل",
          "آگاهی از وضعیت"
        ],
        recommendations: [
          "مراجعه به روان‌پزشک یا متخصص ADHD برای ارزیابی",
          "یادگیری راهکارهای مدیریت ADHD",
          "تقسیم کارها به بخش‌های کوچک‌تر",
          "ایجاد محیط کاری بدون حواس‌پرتی",
          "استفاده از تکنیک‌های مدیریت زمان",
          "ورزش منظم برای تخلیه انرژی",
          "تمرین تکنیک‌های آرام‌سازی"
        ]
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: "سطح شدید ADHD که نیاز به ارزیابی تخصصی دارد.",
      details: "علائم شدید ADHD در شما مشاهده می‌شود که نیاز به ارزیابی تخصصی فوری دارد. این علائم می‌توانند به شدت بر عملکرد تحصیلی، شغلی، روابط و زندگی روزمره شما تأثیر بگذارند.",
      strengths: [
        "شناسایی مشکل",
        "شجاعت در جستجوی کمک"
      ],
      recommendations: [
        "مراجعه فوری به روان‌پزشک یا متخصص ADHD برای ارزیابی تخصصی",
        "ارزیابی جامع ADHD شامل بررسی تاریخچه و علائم",
        "درمان دارویی در صورت نیاز (با تجویز پزشک)",
        "درمان شناختی-رفتاری برای ADHD",
        "آموزش مهارت‌های سازماندهی و مدیریت",
        "حمایت از خانواده و معلمان/همکاران",
        "پیگیری منظم و نظارت نزدیک"
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
    // استفاده از نمره ذخیره شده یا محاسبه شده
    const score = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculateScore());
    const interpretation = getInterpretation(score);
    const maxScore = 72;

    const chartData = {
      labels: ['نمره شما', 'حد پایین', 'حد متوسط', 'حد بالا'],
      datasets: [{
        label: 'تحلیل نمره',
        data: [score, maxScore * 0.3, maxScore * 0.5, maxScore * 0.75],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(249, 115, 22, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)'
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
                <FaBolt className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج علائم ADHD</h1>
                <p className="text-secondaryTextColor">ارزیابی علائم</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{color:interpretation.color}}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح علائم</h3>
                <div className="text-2xl font-bold mb-2" style={{color:interpretation.color}}>{interpretation.level}</div>
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

            {score > 23 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">علائم قابل توجه ADHD. ارزیابی تخصصی توصیه می‌شود.</p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
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
                    title: { 
                      display: true, 
                      text: 'مقایسه نمره با سطوح مختلف',
                      color: '#e5e7eb',
                      font: { size: 16 }
                    }
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      max: maxScore,
                      ticks: { color: '#9ca3af' },
                      grid: { color: '#374151' }
                    },
                    x: { 
                      ticks: { color: '#9ca3af' },
                      grid: { color: '#374151' }
                    }
                  }
                }} />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره ADHD</h4>
              <p className="text-sm text-blue-300">این تست علائم بیش‌فعالی و نقص توجه را می‌سنجد. تشخیص قطعی نیازمند ارزیابی بالینی جامع است.</p>
            </div>
            <button onClick={()=>{setCurrentQuestion(0);setAnswers({});setIsCompleted(false);}} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد تست</button>
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
              <FaBolt className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">علائم ADHD</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion+1} از {questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >چند وقت یکبار:</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map((option, index) =>(
                <button key={`${currentQuestion}-${option.value}`} onClick={()=>handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion+1)/questions.length)*100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{width:`${((currentQuestion+1)/questions.length)*100}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;