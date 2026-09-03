"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHospital } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hads");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "احساس تنش و فشار دارم", type: "A" },
    { text: "از فعالیت‌های قبلی‌ام لذت می‌برم", type: "D", reverse: true },
    { text: "احساس ترس می‌کنم انگار اتفاق بدی خواهد افتاد", type: "A" },
    { text: "می‌توانم بخندم و جنبه خنده‌دار چیزها را ببینم", type: "D", reverse: true },
    { text: "ذهنم پر از نگرانی است", type: "A" },
    { text: "احساس شادی می‌کنم", type: "D", reverse: true },
    { text: "می‌توانم راحت بنشینم و آرام باشم", type: "A", reverse: true },
    { text: "احساس می‌کنم همه چیز کند شده", type: "D" },
    { text: "احساس نگرانی و اضطراب در شکم دارم", type: "A" },
    { text: "به ظاهر خودم بی‌توجه شده‌ام", type: "D" },
    { text: "احساس بی‌قراری می‌کنم", type: "A" },
    { text: "با لذت به چیزها نگاه می‌کنم", type: "D", reverse: true },
    { text: "ناگهان احساس وحشت می‌کنم", type: "A" },
    { text: "می‌توانم از کتاب، رادیو یا تلویزیون لذت ببرم", type: "D", reverse: true }
  ];

  const options = [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "گاهی" },
    { value: 2, label: "اغلب" },
    { value: 3, label: "همیشه" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (3 - value) : value;
    setAnswers({ ...answers, [currentQuestion]: { value: actualValue, type: q.type } });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else setIsCompleted(true);
  };

  const calculateScores = () => {
    const anxiety = Object.values(answers).filter(a => a.type === 'A').reduce((sum, a) => sum + a.value, 0);
    const depression = Object.values(answers).filter(a => a.type === 'D').reduce((sum, a) => sum + a.value, 0);
    return { anxiety, depression };
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


  const getInterpretation = (score, type = 'general') => {
    const typeLabel = type === 'anxiety' ? 'اضطراب' : 'افسردگی';
    
    if (score <= 7) {
      return {
        level: "طبیعی",
        color: "#22c55e",
        desc: `سطح ${typeLabel} در محدوده طبیعی است.`,
        details: `نمره شما نشان می‌دهد که سطح ${typeLabel} در حد طبیعی است. این یک نشانه مثبت از سلامت روانی است.`,
        strengths: [
          `سطح ${typeLabel} طبیعی`,
          "سلامت روانی خوب",
          "عملکرد مناسب"
        ]
      };
    }
    if (score <= 10) {
      return {
        level: "مرزی",
        color: "#eab308",
        desc: `سطح ${typeLabel} در محدوده مرزی است و نیاز به توجه دارد.`,
        details: `سطح ${typeLabel} شما در محدوده مرزی است. ممکن است نیاز به پایش منظم و یادگیری مهارت‌های مقابله داشته باشید.`,
        strengths: [
          "آگاهی از مشکل",
          "امکان بهبود"
        ]
      };
    }
    return {
      level: "غیرطبیعی",
      color: "#ef4444",
      desc: `سطح ${typeLabel} غیرطبیعی است و نیاز به بررسی تخصصی دارد.`,
      details: `سطح ${typeLabel} شما غیرطبیعی است و نیاز به ارزیابی و درمان تخصصی دارد. این می‌تواند بر عملکرد شما تأثیر بگذارد.`,
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (anxiety, depression) => {
    const recommendations = [];
    const hasAbnormal = anxiety > 10 || depression > 10;

    if (hasAbnormal) {
      recommendations.push("مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی");
      recommendations.push("درمان مناسب برای اضطراب یا افسردگی");
    } else if (anxiety > 7 || depression > 7) {
      recommendations.push("پایش منظم علائم و توجه به تغییرات");
      recommendations.push("یادگیری تکنیک‌های مدیریت اضطراب و افسردگی");
    } else {
      recommendations.push("حفظ سبک زندگی سالم");
      recommendations.push("ادامه فعالیت‌های لذت‌بخش");
    }

    if (anxiety > 7) {
      recommendations.push("تمرین تکنیک‌های آرام‌سازی و تنفس عمیق");
      recommendations.push("درمان شناختی-رفتاری برای اضطراب");
    }
    if (depression > 7) {
      recommendations.push("فعال‌سازی رفتاری و افزایش فعالیت‌های لذت‌بخش");
      recommendations.push("تقویت حمایت اجتماعی");
    }

    return recommendations;
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
    const { anxiety, depression } = calculateScores();
    const anxInt = getInterpretation(anxiety, 'anxiety');
    const depInt = getInterpretation(depression, 'depression');
    const recommendations = getRecommendations(anxiety, depression);

    const radarData = {
      labels: ['اضطراب', 'افسردگی'],
      datasets: [{
        label: 'نمرات',
        data: [anxiety, depression],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: 'rgb(99, 102, 241)',
        borderWidth: 3
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
                <FaHospital className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس HADS</h1>
                <p className="text-secondaryTextColor">اضطراب و افسردگی بیمارستانی</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اضطراب</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: anxInt.color }}>{anxiety}</div>
                <div className="text-sm" style={{ color: anxInt.color }}>{anxInt.level}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">افسردگی</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: depInt.color }}>{depression}</div>
                <div className="text-sm" style={{ color: depInt.color }}>{depInt.level}</div>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار</h3>
              <div className="w-full h-80">
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: { r: { beginAtZero: true, max: 21, ticks: { color: '#9ca3af', backdropColor: 'transparent' }, grid: { color: '#374151' }, pointLabels: { color: '#e5e7eb', font: { size: 14 } } } },
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">اضطراب</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{anxInt.desc}</p>
                  {anxInt.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{anxInt.details}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">افسردگی</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{depInt.desc}</p>
                  {depInt.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{depInt.details}</p>
                  )}
                </div>
              </div>
            </div>

            {((anxInt.strengths && anxInt.strengths.length > 0) || (depInt.strengths && depInt.strengths.length > 0)) && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {[...(anxInt.strengths || []), ...(depInt.strengths || [])].filter((v, i, a) => a.indexOf(v) === i).map((strength, index) => (
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
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">درباره نمرات</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-secondaryTextColor">0-7: طبیعی</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">8-10: مرزی</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">11-21: غیرطبیعی</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره HADS</h4>
              <p className="text-sm text-blue-300">HADS یک ابزار 14 سوالی برای غربالگری اضطراب و افسردگی در بیماران بستری است. نمره 0-7 طبیعی، 8-10 مرزی، 11+ غیرطبیعی است.</p>
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
              <FaHospital className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس اضطراب و افسردگی بیمارستانی</h1>
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
            >{questions[currentQuestion].text}</h3>
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







