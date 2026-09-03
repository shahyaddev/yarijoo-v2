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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("lsas");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('fear'); // 'fear' or 'avoidance'
  const [fearAnswers, setFearAnswers] = useState({});
  const [avoidanceAnswers, setAvoidanceAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const situations = [
    "صحبت کردن با فرد ناآشنا",
    "صحبت کردن در جمع کوچک (۲–۳ نفر)",
    "ارائه یا سخنرانی برای گروه",
    "شروع مکالمه",
    "پیوستن به گفت‌وگوی در حال جریان",
    "بیان مخالفت با نظر دیگران",
    "گزارش‌ دادن در جلسه/کلاس",
    "حضور در مهمانی یا دورهمی",
    "غذا خوردن در جمع یا رستوران",
    "نوشیدن/خوردن در برابر دیگران",
    "نوشتن یا امضا در حضور دیگران",
    "استفاده از سرویس بهداشتی عمومی",
    "خرید کردن و صحبت با فروشنده",
    "تماس تلفنی کاری/اداری",
    "بازگرداندن کالا یا اعتراض مودبانه",
    "قرار ملاقات یا آشنایی جدید",
    "حضور به‌عنوان مرکز توجه (مثلاً معرفی شدن)",
    "انجام کار در برابر نگاه دیگران (نوشتن/کار با دست)",
    "درخواست کمک یا اطلاعات از غریبه",
    "بازخورد دادن یا دریافت بازخورد مستقیم",
    "غذاآوردن یا خوردن جلوی جمع (مثلاً مراسم)",
    "ورود به اتاقی که افراد از قبل نشسته‌اند",
    "صحبت با فرد صاحب‌نفوذ/مقام بالاتر",
    "خندیدن/شوخی کردن در جمع"
  ];

  const fearOptions = [
    { label: "هیچ ترس", value: 0 },
    { label: "کمی", value: 1 },
    { label: "متوسط", value: 2 },
    { label: "شدید", value: 3 }
  ];

  const avoidanceOptions = [
    { label: "هرگز اجتناب", value: 0 },
    { label: "گاه‌به‌گاه", value: 1 },
    { label: "اغلب", value: 2 },
    { label: "تقریباً همیشه", value: 3 }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    if (currentPhase === 'fear') {
      const newFearAnswers = { ...fearAnswers, [currentQuestion]: value };
      setFearAnswers(newFearAnswers);
      setCurrentPhase('avoidance');
    } else {
      const newAvoidanceAnswers = { ...avoidanceAnswers, [currentQuestion]: value };
      setAvoidanceAnswers(newAvoidanceAnswers);
      
      if (currentQuestion < situations.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentPhase('fear');
      } else {
        setIsCompleted(true);
      }
    }
  };

  const calculateScores = () => {
    const fearScore = Object.values(fearAnswers).reduce((sum, score) => sum + (score || 0), 0);
    const avoidanceScore = Object.values(avoidanceAnswers).reduce((sum, score) => sum + (score || 0), 0);
    const total = fearScore + avoidanceScore;
    return { fearScore, avoidanceScore, total };
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


  const getInterpretation = (score, type = 'total') => {
    const maxScore = type === 'fear' || type === 'avoidance' ? 72 : 144;
    
    if (score < 30) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: `سطح ${type === 'fear' ? 'ترس' : type === 'avoidance' ? 'اجتناب' : 'اضطراب اجتماعی'} در حد طبیعی است.`
      };
    }
    if (score < 55) {
      return {
        level: "خفیف",
        color: "#84cc16",
        desc: `سطح خفیف ${type === 'fear' ? 'ترس' : type === 'avoidance' ? 'اجتناب' : 'اضطراب اجتماعی'}.`
      };
    }
    if (score < 65) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: `سطح متوسط ${type === 'fear' ? 'ترس' : type === 'avoidance' ? 'اجتناب' : 'اضطراب اجتماعی'}.`
      };
    }
    if (score <= 80) {
      return {
        level: "شدید",
        color: "#f97316",
        desc: `سطح شدید ${type === 'fear' ? 'ترس' : type === 'avoidance' ? 'اجتناب' : 'اضطراب اجتماعی'}.`
      };
    }
    return {
      level: "بسیار شدید",
      color: "#ef4444",
      desc: `سطح بسیار شدید ${type === 'fear' ? 'ترس' : type === 'avoidance' ? 'اجتناب' : 'اضطراب اجتماعی'}.`
    };
  };

  const getRecommendations = (fearScore, avoidanceScore, totalScore) => {
    const recommendations = [];
    const hasSevere = totalScore >= 65 || fearScore >= 40 || avoidanceScore >= 40;

    if (hasSevere) {
      recommendations.push("مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی");
      recommendations.push("درمان شناختی-رفتاری (CBT) برای اضطراب اجتماعی");
      recommendations.push("مواجهه درمانی برای کاهش ترس و اجتناب");
    } else if (totalScore >= 55) {
      recommendations.push("یادگیری تکنیک‌های مدیریت اضطراب اجتماعی");
      recommendations.push("تمرین مهارت‌های اجتماعی");
      recommendations.push("مواجهه تدریجی با موقعیت‌های اجتماعی");
    } else {
      recommendations.push("حفظ فعالیت‌های اجتماعی");
      recommendations.push("توسعه مهارت‌های ارتباطی");
    }

    if (fearScore >= 40) {
      recommendations.push("تمرین تکنیک‌های آرام‌سازی و تنفس");
      recommendations.push("بازسازی شناختی افکار اضطراب‌زا");
    }
    if (avoidanceScore >= 40) {
      recommendations.push("برنامه مواجهه تدریجی");
      recommendations.push("تعیین اهداف کوچک برای مشارکت اجتماعی");
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
    const { fearScore, avoidanceScore, total } = calculateScores();
    const totalInterpretation = getInterpretation(total, 'total');
    const fearInterpretation = getInterpretation(fearScore, 'fear');
    const avoidanceInterpretation = getInterpretation(avoidanceScore, 'avoidance');
    const recommendations = getRecommendations(fearScore, avoidanceScore, total);
    const maxScore = 144;

    const chartData = {
      labels: ['ترس', 'اجتناب', 'نمره کل'],
      datasets: [{
        label: 'نمرات LSAS',
        data: [fearScore, avoidanceScore, total],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          totalInterpretation.color + 'B3'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          totalInterpretation.color
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست LSAS</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره ترس</h3>
                <div className="text-4xl font-bold mb-2 text-red-500">{fearScore}</div>
                <div className="text-sm text-secondaryTextColor">از 72</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره اجتناب</h3>
                <div className="text-4xl font-bold mb-2 text-yellow-500">{avoidanceScore}</div>
                <div className="text-sm text-secondaryTextColor">از 72</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: totalInterpretation.color }}>{total}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
                <div className="text-xs mt-1" style={{ color: totalInterpretation.color }}>{totalInterpretation.level}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-red-400 mb-2">ترس: {fearInterpretation.level}</h4>
                  <p className="text-sm text-secondaryTextColor">{fearInterpretation.desc}</p>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">اجتناب: {avoidanceInterpretation.level}</h4>
                  <p className="text-sm text-secondaryTextColor">{avoidanceInterpretation.desc}</p>
                </div>
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
                    title: { display: true, text: 'تحلیل نمرات ترس و اجتناب', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 144, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره LSAS</h4>
              <p className="text-sm text-blue-300">LSAS یک مقیاس 24 سوالی برای سنجش اضطراب اجتماعی است. هر موقعیت از نظر ترس (0-3) و اجتناب (0-3) ارزیابی می‌شود. نمره کل 144 است.</p>
            </div>

            <button onClick={() => { setCurrentQuestion(0); setFearAnswers({}); setAvoidanceAnswers({}); setCurrentPhase('fear'); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست LSAS - هراس اجتماعی</h1>
              <p className="text-secondaryTextColor">موقعیت {currentQuestion + 1} از {situations.length} - {currentPhase === 'fear' ? 'میزان ترس' : 'میزان اجتناب'}</p>
            </div>
          </div>

          <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
            <div className="mb-4 p-3 bg-primaryThemeColor/10 rounded-lg border border-primaryThemeColor/20">
              <p className="text-sm text-secondaryTextColor">در هفته گذشته، در این موقعیت:</p>
            </div>
            <h3 className="text-xl font-bold text-primaryThemeColor mb-4">{situations[currentQuestion]}</h3>
            <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm font-medium text-blue-400">
                {currentPhase === 'fear' ? '🔸 میزان ترس خود را مشخص کنید' : '🔸 میزان اجتناب خود را مشخص کنید'}
              </p>
            </div>
            <div className="space-y-3">
              {(currentPhase === 'fear' ? fearOptions : avoidanceOptions).map((option) => (
                <button key={option.value} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all">
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round((((currentQuestion * 2) + (currentPhase === 'avoidance' ? 1 : 0)) / (situations.length * 2)) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${(((currentQuestion * 2) + (currentPhase === 'avoidance' ? 1 : 0)) / (situations.length * 2)) * 100}%` }}></div>
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