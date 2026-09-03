"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaSync } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ocir");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = ["افکار ناخواسته یا تصاویر مزاحم","مجبورم چیزها را چک کنم","نگران آلودگی یا چرک هستم","نیاز به نظم و تقارن دارم","افکار وحشتناک در مورد صدمه زدن به خود یا دیگران","افکار ناخواسته درباره موضوعات جنسی","احتیاج به انجام مجدد یا بازخوانی دارم","نگران اشتباهات هستم","مشکل در دور انداختن چیزها دارم","نگران نظم و ترتیب هستم","افکار ناخواسته درباره بد اتفاق افتادن","احتیاج به شستشوی مکرر دارم","افکار وحشتناک یا منزجرکننده دارم","نگران آلودگی بدن هستم","احتیاج به شمردن موارد دارم","مجبورم چیزها را مرتب کنم","نیاز به چک کردن مجدد دارم","نگرانی درباره از دست دادن چیزهای مهم"];

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
    if (score < 21) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "علائم OCD در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که علائم وسواس فکری-عملی در حد طبیعی است. شما الگوهای فکری و رفتاری طبیعی دارید و وسواس به طور قابل توجهی زندگی شما را مختل نمی‌کند.",
        strengths: [
          "عدم علائم بالینی OCD",
          "عملکرد مناسب در زندگی روزمره",
          "کنترل مناسب افکار و رفتارها",
          "کیفیت زندگی خوب"
        ]
      };
    }
    if (score <= 25) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: "علائم خفیف OCD که نیاز به توجه دارد.",
        details: "علائم خفیف وسواس فکری-عملی در شما مشاهده می‌شود. این علائم ممکن است گاهی اوقات آزاردهنده باشند اما هنوز به طور قابل توجهی زندگی شما را مختل نکرده‌اند.",
        strengths: [
          "آگاهی از مشکل",
          "قابل کنترل بودن علائم",
          "برخی مهارت‌های مقابله"
        ]
      };
    }
    if (score <= 30) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "علائم متوسط OCD که نیاز به ارزیابی دارد.",
        details: "علائم متوسط وسواس فکری-عملی در شما مشاهده می‌شود. این علائم شروع به تأثیرگذاری بر عملکرد روزانه، کار و روابط شما کرده‌اند. ارزیابی و مداخله تخصصی توصیه می‌شود.",
        strengths: [
          "شناسایی مشکل",
          "آمادگی برای بهبود"
        ]
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: "علائم شدید OCD که نیاز به مراقبت فوری دارد.",
      details: "علائم شدید وسواس فکری-عملی در شما مشاهده می‌شود که نیاز به مداخله تخصصی فوری دارد. این علائم به شدت بر عملکرد روزانه، کار، روابط و کیفیت زندگی شما تأثیر می‌گذارند.",
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score < 21) {
      return [
        "حفظ سبک زندگی سالم",
        "توجه به علائم هشداردهنده",
        "مدیریت استرس"
      ];
    }
    if (score <= 25) {
      return [
        "یادگیری تکنیک‌های مدیریت افکار وسواسی",
        "مشاوره با روان‌شناس",
        "تمرین تکنیک‌های آرام‌سازی"
      ];
    }
    if (score <= 30) {
      return [
        "مراجعه به روان‌شناس یا روان‌پزشک",
        "درمان شناختی-رفتاری (CBT) برای OCD",
        "برنامه درمانی ساختاریافته"
      ];
    }
    return [
      "مراجعه فوری به روان‌پزشک",
      "درمان تخصصی OCD شامل ERP",
      "برنامه درمانی جامع",
      "نظارت نزدیک"
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
                <FaSync className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج OCI-R</h1>
                <p className="text-secondaryTextColor">وسواس فکری عملی</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره</h3>
                <div className="text-4xl font-bold mb-2" style={{color:interpretation.color}}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 72</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold" style={{color:interpretation.color}}>{interpretation.level}</div>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                  {interpretation.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {score >= 21 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">علائم OCD قابل توجه. ارزیابی تخصصی توصیه می‌شود.</p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره OCI-R</h4>
              <p className="text-sm text-blue-300">OCI-R یک ابزار 18 سوالی برای سنجش علائم اختلال وسواس فکری-عملی است. نمره 21 یا بالاتر نشان‌دهنده احتمال OCD است.</p>
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
              <FaSync className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس وسواس OCI-R</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion+1} از {questions.length}</p>
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
              {options.map((option, index) =>(
                <button key={`${currentQuestion}-${option.value}`} onClick={()=>handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
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







