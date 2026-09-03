"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaSmileBeam } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("swls");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "از بسیاری جهات، زندگی‌ام به آرمانم نزدیک است",
    "شرایط زندگی‌ام عالی است",
    "از زندگی‌ام راضی هستم",
    "تاکنون چیزهای مهمی که می‌خواستم در زندگی به دست آورده‌ام",
    "اگر می‌توانستم زندگی‌ام را دوباره زندگی کنم، تقریباً هیچ چیز را تغییر نمی‌دادم"
  ];

  const options = [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "کمی مخالفم" },
    { value: 4, label: "نه موافق نه مخالف" },
    { value: 5, label: "کمی موافقم" },
    { value: 6, label: "موافقم" },
    { value: 7, label: "کاملاً موافقم" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else setIsCompleted(true);
  };

  const calculateScore = () => Object.values(answers).reduce((sum, score) => sum + score, 0);

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
    if (score <= 9) {
      return {
        level: "بسیار ناراضی",
        color: "#dc2626",
        desc: "رضایت از زندگی بسیار پایین",
        details: "نمره شما نشان می‌دهد که از جنبه‌های مهم زندگی ناراضی هستید. این وضعیت می‌تواند بر سلامت روانی و کیفیت زندگی شما تأثیر منفی بگذارد.",
        strengths: ["آگاهی از نارضایتی", "آمادگی برای تغییر"],
        recommendations: ["مشاوره فوری با روان‌شناس", "شناسایی منابع نارضایتی", "ایجاد اهداف کوچک قابل دستیابی", "تقویت حمایت اجتماعی", "فعالیت بدنی منظم"]
      };
    }
    if (score <= 14) {
      return {
        level: "ناراضی",
        color: "#ef4444",
        desc: "رضایت از زندگی پایین",
        details: "شما از اکثر جنبه‌های زندگی راضی نیستید. این نارضایتی می‌تواند منجر به مشکلات روانی و جسمی شود و نیاز به توجه دارد.",
        strengths: ["آمادگی برای بهبود", "توانایی ارزیابی زندگی"],
        recommendations: ["مشاوره روان‌شناختی", "کار بر روی ارزش‌های شخصی", "ایجاد تغییرات مثبت کوچک", "شبکه حمایتی قوی", "یادگیری مهارت‌های مقابله‌ای"]
      };
    }
    if (score <= 19) {
      return {
        level: "کمی ناراضی",
        color: "#f97316",
        desc: "رضایت کمتر از متوسط",
        details: "نمره شما نشان می‌دهد که از برخی جنبه‌های زندگی راضی نیستید. این فرصتی برای شناسایی و بهبود حوزه‌های نارضایتی است.",
        strengths: ["آگاهی از چالش‌ها", "پتانسیل بهبود"],
        recommendations: ["شناسایی حوزه‌های نارضایتی", "تمرکز بر جنبه‌های مثبت", "ایجاد اهداف واقع‌بینانه", "تقویت روابط معنادار", "خودشناسی بیشتر"]
      };
    }
    if (score <= 24) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "رضایت متوسط",
        details: "شما رضایت متوسطی از زندگی دارید. گرچه وضعیت بد نیست، اما فضای بهبود وجود دارد.",
        strengths: ["تعادل نسبی", "ثبات", "توانایی سازگاری"],
        recommendations: ["شناسایی اهداف زندگی", "تقویت روابط مثبت", "توسعه علایق شخصی", "تمرین قدردانی", "ایجاد معنا و هدف"]
      };
    }
    if (score <= 29) {
      return {
        level: "راضی",
        color: "#84cc16",
        desc: "رضایت خوب",
        details: "شما از زندگی خود راضی هستید و کیفیت زندگی مناسبی دارید. این یک نشانه مثبت از سلامت روانی است.",
        strengths: ["رضایت مناسب", "نگرش مثبت", "سازگاری خوب", "روابط مثبت"],
        recommendations: ["حفظ شیوه زندگی فعلی", "توجه به تعادل", "کمک به دیگران", "ادامه رشد شخصی", "قدردانی از دستاوردها"]
      };
    }
    return {
      level: "بسیار راضی",
      color: "#22c55e",
      desc: "رضایت عالی از زندگی",
      details: "شما از زندگی خود بسیار راضی هستید و احساس شادی و معنا می‌کنید. این سطح رضایت نشان‌دهنده سلامت روانی عالی است.",
      strengths: ["رضایت بالا", "شادی پایدار", "معنادار بودن زندگی", "روابط قوی", "هدفمندی"],
      recommendations: ["حفظ این وضعیت", "به اشتراک‌گذاری تجربیات مثبت", "کمک به دیگران", "قدردانی روزانه", "ادامه رشد و یادگیری"]
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
    const chartData = {
      labels: ['نمره شما'],
      datasets: [{
        label: 'رضایت از زندگی',
        data: [score],
        backgroundColor: [interpretation.color + 'B3'],
        borderColor: [interpretation.color],
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
                <FaSmileBeam className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس رضایت از زندگی</h1>
                <p className="text-secondaryTextColor">SWLS</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 35</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">وضعیت</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(score / 35) * 100}%`, backgroundColor: interpretation.color }}></div>
              </div>
              <div className="text-center text-sm text-secondaryTextColor">{Math.round((score / 35) * 100)}% رضایت</div>
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
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره SWLS</h4>
              <p className="text-sm text-blue-300">مقیاس رضایت از زندگی (SWLS) یک ابزار 5 سوالی برای سنجش رضایت کلی از زندگی است. این یکی از پرکاربردترین ابزارهای سنجش بهزیستی ذهنی است.</p>
            </div>
            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد تست</button>
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
              <FaSmileBeam className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس رضایت از زندگی</h1>
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

export default Page;




