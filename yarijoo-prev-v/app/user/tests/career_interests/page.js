"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBriefcase } from "react-icons/fa";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("career_interests");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  { text: "تعمیر و کار با ابزار", type: "realistic" },
  { text: "تحقیق و آزمایش علمی", type: "investigative" },
  { text: "طراحی و هنر", type: "artistic" },
  { text: "کمک به مردم و تدریس", type: "social" },
  { text: "مدیریت و رهبری", type: "enterprising" },
  { text: "کار با اعداد و داده", type: "conventional" },
  { text: "کار فیزیکی و ورزش", type: "realistic" },
  { text: "حل مسائل پیچیده", type: "investigative" },
  { text: "نوشتن و موسیقی", type: "artistic" },
  { text: "مشاوره و راهنمایی", type: "social" },
  { text: "فروش و متقاعدسازی", type: "enterprising" },
  { text: "سازماندهی و دقت", type: "conventional" }
        ]

  const options = [
  {
    "value": 1,
    "label": "اصلاً علاقه ندارم"
  },
  {
    "value": 2,
    "label": "علاقه کمی دارم"
  },
  {
    "value": 3,
    "label": "متوسط"
  },
  {
    "value": 4,
    "label": "علاقه دارم"
  },
  {
    "value": 5,
    "label": "خیلی علاقه دارم"
  }
        ]

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        const scores = calculateScores();
        const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
        const topInterests = getTopInterests(scores);
        const primaryType = getTypeInfo(topInterests[0]?.type || 'realistic');
        
        try {
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            return answer?.value || 0;
          });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: totalScore,
            total_score: totalScore,
            level: primaryType.persian,
            interpretation: {
              level: primaryType.persian,
              color: primaryType.color,
              desc: primaryType.desc,
              scores: scores,
              topInterests: topInterests
            },
            scores: scores
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

  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    setAnswers({ ...answers, [currentQuestion]: { value, type: q.type } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const scores = { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 };
    questions.forEach((q, index) => {
      if (answers[index]) {
        scores[q.type] += answers[index].value || 0;
      }
    });
    return scores;
  };

  const getTopInterests = (scores) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([type, score]) => ({ type, score }));
  };

  const getTypeInfo = (type) => {
    const types = {
      realistic: {
        title: "واقع‌گرا (Realistic - R)",
        persian: "واقع‌گرا",
        color: "#ef4444",
        desc: "علاقه به کار با ابزار، ماشین‌آلات و کارهای فیزیکی.",
        careers: ["مهندس مکانیک", "تکنسین", "نجار", "مکانیک", "معمار", "کشاورز"],
        traits: ["عملی", "فیزیکی", "ابزارگرا"]
      },
      investigative: {
        title: "تحقیقی (Investigative - I)",
        persian: "تحقیقی",
        color: "#3b82f6",
        desc: "علاقه به تحلیل، تحقیق و علم.",
        careers: ["دانشمند", "پزشک", "محقق", "مهندس نرم‌افزار", "تحلیل‌گر داده", "شیمیدان"],
        traits: ["تحلیلی", "علمی", "کنجکاو"]
      },
      artistic: {
        title: "هنری (Artistic - A)",
        persian: "هنری",
        color: "#8b5cf6",
        desc: "علاقه به خلاقیت، بیان و هنر.",
        careers: ["هنرمند", "طراح", "نویسنده", "موسیقیدان", "فیلمساز", "معمار"],
        traits: ["خلاق", "بیانی", "مبتکر"]
      },
      social: {
        title: "اجتماعی (Social - S)",
        persian: "اجتماعی",
        color: "#22c55e",
        desc: "علاقه به کمک، آموزش و خدمت به دیگران.",
        careers: ["معلم", "مشاور", "پرستار", "روانشناس", "مددکار اجتماعی", "پزشک"],
        traits: ["کمک‌کننده", "آموزش‌دهنده", "همدل"]
      },
      enterprising: {
        title: "متشبث (Enterprising - E)",
        persian: "متشبث",
        color: "#f59e0b",
        desc: "علاقه به رهبری، فروش و متقاعدسازی.",
        careers: ["مدیر", "فروشنده", "وکیل", "کارآفرین", "مدیر بازاریابی", "سرمایه‌گذار"],
        traits: ["رهبر", "متقاعدکننده", "جسور"]
      },
      conventional: {
        title: "عرفی (Conventional - C)",
        persian: "عرفی",
        color: "#64748b",
        desc: "علاقه به سازماندهی، داده و جزئیات.",
        careers: ["حسابدار", "منشی", "تحلیل‌گر مالی", "کتابدار", "مدیر داده", "اداری"],
        traits: ["منظم", "دقیق", "سازمان‌یافته"]
      }
    };
    return types[type] || types.realistic;
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
    const topInterests = getTopInterests(scores);
    const primaryType = getTypeInfo(topInterests[0].type);

    const radarData = {
      labels: ['واقع‌گرا (R)', 'تحقیقی (I)', 'هنری (A)', 'اجتماعی (S)', 'متشبث (E)', 'عرفی (C)'],
      datasets: [{
        label: 'علایق شغلی',
        data: [scores.realistic, scores.investigative, scores.artistic, scores.social, scores.enterprising, scores.conventional],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      }]
    };

    const hollandCode = topInterests.map(item => {
      const codes = { realistic: 'R', investigative: 'I', artistic: 'A', social: 'S', enterprising: 'E', conventional: 'C' };
      return codes[item.type];
    }).join('') || 'نامشخص';

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaBriefcase className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست علایق شغلی (Holland)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">کد Holland</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: primaryType.color }}>{hollandCode}</div>
              <div className="text-2xl font-bold mb-2" style={{ color: primaryType.color }}>{primaryType.title}</div>
              <div className="text-sm text-secondaryTextColor mb-2">{primaryType.desc}</div>
              <p className="text-sm text-secondaryTextColor mt-2">
                کد Holland شما ترکیبی از {hollandCode.split('').join(', ')} است. این نشان می‌دهد که شما بیشتر علاقه به {primaryType.persian} دارید.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(scores).map(([type, score]) => {
                const typeInfo = getTypeInfo(type);
                return (
                  <div key={type} className="bg-darkThemeColor rounded-2xl p-4">
                    <h4 className="text-sm font-medium text-secondaryTextColor mb-2">{typeInfo.persian}</h4>
                    <div className="text-2xl font-bold mb-1" style={{ color: typeInfo.color }}>{score}</div>
                    <div className="text-xs text-secondaryTextColor">از 10</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">مشاغل پیشنهادی</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topInterests.slice(0, 3).map((interest, idx) => {
                  const typeInfo = getTypeInfo(interest.type);
                  return (
                    <div key={interest.type} className="bg-secondaryThemeColor rounded-xl p-4">
                      <h4 className="font-medium text-primaryTextColor mb-2">{idx + 1}. {typeInfo.title}</h4>
                      <p className="text-sm text-secondaryTextColor mb-3">{typeInfo.desc}</p>
                      <div>
                        <p className="text-xs font-medium text-secondaryTextColor mb-2">مشاغل مرتبط:</p>
                        <ul className="text-xs text-secondaryTextColor space-y-1">
                          {typeInfo.careers.slice(0, 4).map((career, i) => (
                            <li key={i}>• {career}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار علایق شغلی (RIASEC)</h3>
              <div className="w-full h-80">
                <Radar data={radarData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 10,
                      ticks: { color: '#9ca3af', stepSize: 2 },
                      grid: { color: '#374151' },
                      pointLabels: { color: '#e5e7eb' }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'مدل Holland (RIASEC)', color: '#e5e7eb', font: { size: 16 } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 نکته مهم</h4>
              <p className="text-sm text-blue-300 mb-2">
                علایق شغلی یکی از مهم‌ترین عوامل رضایت شغلی است. شغل سازگار با علایق شما = رضایت، عملکرد و ماندگاری بالاتر.
              </p>
              <p className="text-sm text-blue-300">
                اما به یاد داشته باشید که علاقه تنها عامل نیست - مهارت‌ها، ارزش‌ها، شخصیت و بازار کار هم مهم هستند.
              </p>
            </div>

            <button onClick={async () => { 
              await resetResult();
              setCurrentQuestion(0); 
              setAnswers({}); 
              setIsCompleted(false); 
            }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">
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
              <FaBriefcase className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست علایق شغلی (Holland)</h1>
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