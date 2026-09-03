"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaExclamationCircle } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("pcl5");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = ["خاطرات ناخواسته رویداد","کابوس‌های مرتبط","احساس مجدد تجربه","ناراحتی از یادآوری‌ها","واکنش‌های بدنی","اجتناب از افکار","اجتناب از یادآورها","مشکل یادآوری جزئیات","باورهای منفی","سرزنش خود یا دیگران","احساسات منفی قوی","کاهش علاقه","احساس جدایی از دیگران","سختی احساسات مثبت","رفتار تحریک‌پذیر","ریسک‌پذیری","بیش‌هوشیاری","واکنش تعجب بیش از حد","مشکل تمرکز","مشکل خواب"];

  const options = [{value:0,label:"اصلاً"},{value:1,label:"کمی"},{value:2,label:"متوسط"},{value:3,label:"زیاد"},{value:4,label:"خیلی زیاد"}];

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
    if (score < 31) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "علائم PTSD در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که علائم اختلال استرس پس از سانحه در حد طبیعی است."
      };
    }
    if (score <= 33) {
      return {
        level: "مرزی",
        color: "#eab308",
        desc: "علائم احتمالی PTSD که نیاز به بررسی دارد.",
        details: "نمره شما در محدوده مرزی است و ممکن است نشان‌دهنده علائم PTSD باشد. ارزیابی تخصصی توصیه می‌شود."
      };
    }
    if (score <= 50) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "علائم متوسط PTSD که نیاز به مداخله دارد.",
        details: "علائم متوسط PTSD در شما مشاهده می‌شود. مراجعه به متخصص سلامت روان برای ارزیابی و درمان توصیه می‌شود."
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: "علائم شدید PTSD که نیاز به مراقبت فوری دارد.",
      details: "علائم شدید PTSD در شما مشاهده می‌شود. مراجعه فوری به متخصص سلامت روان برای ارزیابی و درمان ضروری است."
    };
  };

  const getRecommendations = (score) => {
    if (score < 31) {
      return [
        "حفظ سبک زندگی سالم و فعال",
        "مدیریت استرس و تکنیک‌های آرام‌سازی",
        "حفظ روابط اجتماعی و حمایت خانوادگی",
        "در صورت تجربه رویداد استرس‌زا، توجه به علائم"
      ];
    }
    if (score <= 33) {
      return [
        "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی",
        "درمان شناختی-رفتاری برای PTSD (CBT یا EMDR)",
        "یادگیری تکنیک‌های مدیریت استرس",
        "ایجاد سیستم حمایتی قوی"
      ];
    }
    if (score <= 50) {
      return [
        "مراجعه فوری به روان‌پزشک برای ارزیابی و درمان",
        "درمان تخصصی PTSD (EMDR، درمان شناختی-رفتاری)",
        "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
        "ایجاد سیستم حمایتی قوی و نظارت مداوم"
      ];
    }
    return [
      "مراجعه فوری و اورژانسی به روان‌پزشک",
      "درمان فشرده PTSD شامل EMDR و CBT",
      "برنامه درمانی جامع با نظارت نزدیک",
      "ایجاد سیستم حمایتی قوی",
      "در صورت وجود افکار خودکشی، تماس فوری با خط بحران"
    ];
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
    const recommendations = getRecommendations(score);
    const maxScore = 80;

    const chartData = {
      labels: ['نمره شما', 'آستانه مرزی (31)', 'آستانه متوسط (50)'],
      datasets: [{
        label: 'نمره PTSD',
        data: [score, 31, 50],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(234, 179, 8, 0.3)',
          'rgba(249, 115, 22, 0.3)'
        ],
        borderColor: [
          interpretation.color,
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
                <FaExclamationCircle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج PCL-5</h1>
                <p className="text-secondaryTextColor">علائم PTSD</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره</h3>
                <div className="text-4xl font-bold mb-2" style={{color:interpretation.color}}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 80</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold mb-2" style={{color:interpretation.color}}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            {score >= 31 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار</h4>
                <p className="text-sm text-red-300">نمره شما نشان‌دهنده احتمال وجود PTSD است. ارزیابی تخصصی توصیه می‌شود.</p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره PTSD و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 80, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">درباره نمرات</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-secondaryTextColor">0-30: کمینه (طبیعی)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">31-33: مرزی</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-secondaryTextColor">34-50: متوسط</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">51-80: شدید</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره PCL-5</h4>
              <p className="text-sm text-blue-300">PCL-5 یک ابزار 20 سوالی برای سنجش علائم اختلال استرس پس از سانحه (PTSD) است. نمره 31-33 یا بالاتر نشان‌دهنده احتمال PTSD است.</p>
            </div>
            <button onClick={()=>{setCurrentQuestion(0);setAnswers({});setIsCompleted(false);}} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد</button>
          </div>
        </div>
            <button 
              onClick={async () => {
                await resetResult();
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
                setSavedScore(null);
              }} 
              className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors"
            >
              انجام مجدد تست
            </button>

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
              <FaExclamationCircle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">چک‌لیست PTSD</h1>
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
            >در ماه گذشته:</h2>
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







