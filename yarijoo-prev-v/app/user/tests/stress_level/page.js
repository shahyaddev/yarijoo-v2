"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaExclamationTriangle } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("stress_level");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "احساس می‌کنم که کنترل کمی بر زندگی خود دارم",
        "مشکلات زندگی باعث نگرانی مداوم من می‌شود",
        "احساس می‌کنم که تحت فشار مداوم هستم",
        "مشکلات زندگی بر خواب من تأثیر منفی می‌گذارد",
        "احساس می‌کنم که انرژی کافی برای انجام کارهای روزمره ندارم",
        "مشکلات زندگی باعث سردرد و دردهای جسمی می‌شود",
        "احساس می‌کنم که نمی‌توانم با مشکلات کنار بیایم",
        "مشکلات زندگی باعث مشکل در تمرکز می‌شود",
        "احساس می‌کنم که زندگی من پر از استرس است",
        "مشکلات زندگی باعث تحریک‌پذیری و عصبانیت می‌شود",
        "احساس می‌کنم که نمی‌توانم آرام باشم",
        "مشکلات زندگی باعث مشکل در تصمیم‌گیری می‌شود",
        "احساس می‌کنم که تحت فشار زمانی مداوم هستم",
        "مشکلات زندگی بر روابط من تأثیر منفی می‌گذارد",
        "احساس می‌کنم که نمی‌توانم از زندگی لذت ببرم",
        "مشکلات زندگی باعث احساس ناامیدی می‌شود",
        "احساس می‌کنم که نمی‌توانم با تغییرات کنار بیایم",
        "مشکلات زندگی باعث مشکل در حفظ روابط اجتماعی می‌شود",
        "احساس می‌کنم که نمی‌توانم از عهده مسئولیت‌هایم برآیم",
        "مشکلات زندگی باعث احساس بی‌ارزشی می‌شود",
        "احساس می‌کنم که نمی‌توانم با مشکلات مالی کنار بیایم",
        "مشکلات زندگی باعث مشکل در حفظ سلامت جسمی می‌شود",
        "احساس می‌کنم که نمی‌توانم با مشکلات خانوادگی کنار بیایم",
        "مشکلات زندگی باعث احساس اضطراب مداوم می‌شود",
        "احساس می‌کنم که نمی‌توانم با مشکلات کاری کنار بیایم"
    ];

    const options = [
        { value: 1, label: "هرگز" },
        { value: 2, label: "به ندرت" },
        { value: 3, label: "گاهی اوقات" },
        { value: 4, label: "اغلب" },
        { value: 5, label: "همیشه" }
    ];

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
        const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
        return totalScore;
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
    const maxScore = 125;
    
    if (score <= 50) {
      return {
        level: "استرس پایین",
        color: "#22c55e",
        desc: "سطح استرس شما پایین است. می‌توانید با چالش‌های زندگی به خوبی کنار بیایید.",
        details: "نمره شما نشان می‌دهد که سطح استرس در حد پایین است و می‌توانید با مشکلات زندگی به خوبی مقابله کنید.",
        strengths: ["مدیریت خوب استرس", "توانایی مقابله", "تعادل زندگی"],
        recommendations: [
          "**حفظ وضعیت**: ادامه مدیریت خوب استرس",
          "**مراقبت**: مراقب تغییرات استرس‌زا باشید"
        ]
      };
    } else if (score <= 75) {
      return {
        level: "استرس متوسط",
        color: "#eab308",
        desc: "سطح استرس متوسط. برخی چالش‌ها وجود دارد اما قابل مدیریت است.",
        details: "استرس متوسط در شما مشاهده می‌شود. برخی مشکلات وجود دارد اما می‌توانید با یادگیری مهارت‌های مدیریت استرس بهتر کنار بیایید.",
        strengths: [],
        recommendations: [
          "**مهارت‌های مدیریت استرس**: یادگیری تکنیک‌های آرامش",
          "**مدیریت زمان**: اولویت‌بندی و برنامه‌ریزی",
          "**حمایت اجتماعی**: تقویت روابط و شبکه حمایتی",
          "**ورزش و فعالیت**: فعالیت بدنی منظم",
          "**خواب**: بهبود کیفیت خواب"
        ]
      };
    } else if (score <= 100) {
      return {
        level: "استرس بالا",
        color: "#f97316",
        desc: "سطح استرس بالا. نیاز به توجه و مدیریت فوری دارید.",
        details: "استرس بالا در شما مشاهده می‌شود که می‌تواند بر سلامت جسمی و روانی شما تأثیر بگذارد. مدیریت فوری استرس ضروری است.",
        strengths: [],
        recommendations: [
          "**مدیریت فوری استرس**: استفاده از تکنیک‌های آرامش روزانه",
          "**شناسایی منابع استرس**: چه چیز شما را استرس می‌دهد؟",
          "**مرزگذاری**: گفتن نه و تعیین حدود",
          "**حمایت حرفه‌ای**: مشاوره با روانشناس",
          "**مراقبت از خود**: خواب، ورزش، تغذیه سالم",
          "**زمان استراحت**: اختصاص زمان برای آرامش"
        ]
      };
    } else {
      return {
        level: "استرس بسیار بالا",
        color: "#dc2626",
        desc: "استرس بسیار بالا. نیاز به مداخله فوری و درمان دارید.",
        details: "استرس شما در سطح بسیار بالایی است و می‌تواند منجر به مشکلات جدی سلامت جسمی و روانی شود. مداخله فوری و درمان ضروری است.",
        strengths: [],
        recommendations: [
          "**🚨 مداخله فوری**: مشاوره فوری با روانشناس یا پزشک",
          "**درمان تخصصی**: برنامه مدیریت استرس ساختاریافته",
          "**بررسی منابع استرس**: شناسایی و رفع منابع اصلی استرس",
          "**مراقبت پزشکی**: بررسی تأثیر استرس بر سلامت جسمی",
          "**حمایت 24/7**: کمک از خانواده و دوستان",
          "**تغییرات اساسی**: در صورت نیاز، تغییرات بزرگ در زندگی",
          "**برنامه ایمنی**: اگر افکار خودکشی دارید، فوراً کمک بگیرید"
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
    const maxScore = 125;


        return (
            <div className="w-full flex flex-col items-center">
                <Header />
                <MobileHeader />

                <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                    <Sidebar />

                    <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                                <FaExclamationTriangle className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سطح استرس</h1>
                                <p className="text-secondaryTextColor">ارزیابی سطح استرس عمومی شما</p>
                            </div>
                        </div>

                        <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                            <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره استرس</h3>
                            <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                            <div className="text-sm text-secondaryTextColor mb-4">از 125</div>
                            <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                            <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
                            <p className="text-sm text-secondaryTextColor mt-2">{interpretation.details}</p>
                        </div>

                        {interpretation.strengths && interpretation.strengths.length > 0 && (
                            <div className="bg-darkThemeColor rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                                <ul className="space-y-2">
                                    {interpretation.strengths.map((strength, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
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
                                {interpretation.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                                        <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
                            <div className="w-full h-80">
                                <Bar data={{
                                    labels: ['نمره شما', 'پایین (0-50)', 'متوسط (51-75)', 'بالا (76-100)', 'بسیار بالا (101-125)'],
                                    datasets: [{
                                        label: 'نمره استرس',
                                        data: [score, 50, 75, 100, 125],
                                        backgroundColor: [
                                            interpretation.color + 'B3',
                                            'rgba(34, 197, 94, 0.3)',
                                            'rgba(234, 179, 8, 0.3)',
                                            'rgba(249, 115, 22, 0.3)',
                                            'rgba(239, 68, 68, 0.3)'
                                        ],
                                        borderColor: [
                                            interpretation.color,
                                            'rgb(34, 197, 94)',
                                            'rgb(234, 179, 8)',
                                            'rgb(249, 115, 22)',
                                            'rgb(239, 68, 68)'
                                        ],
                                        borderWidth: 2
                                    }]
                                }} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'تحلیل استرس', color: '#e5e7eb', font: { size: 16 } }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: 125, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                                        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                                    }
                                }} />
                            </div>
                        </div>

                        {score > 100 && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار فوری</h4>
                                <p className="text-sm text-red-300">
                                    استرس شما در سطح بسیار بالایی است که می‌تواند منجر به مشکلات جدی سلامت شود. اگر افکار خودکشی دارید، فوراً با 115 تماس بگیرید.
                                </p>
                            </div>
                        )}

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">راهنمایی‌های اضافی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">علائم هشدار</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• احساس فشار مداوم</li>
                                        <li>• مشکل در خواب</li>
                                        <li>• تأثیر منفی بر روابط</li>
                                        <li>• کمبود انرژی و انگیزه</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">راه‌های پیشگیری</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• توسعه مهارت‌های مدیریت زمان</li>
                                        <li>• تمرین تکنیک‌های آرام‌سازی</li>
                                        <li>• حفظ تعادل زندگی</li>
                                        <li>• جستجوی حمایت اجتماعی</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setCurrentQuestion(0);
                                setAnswers({});
                                setIsCompleted(false);
                            }}
                            className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors"
                        >
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
            <Header />
            <MobileHeader />

            <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                <Sidebar />

                <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                            <FaExclamationTriangle className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست سطح استرس</h1>
                            <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
                        </div>
                    </div>

                    <div className="w-full bg-darkThemeColor rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-primaryTextColor mb-6">
                            {questions[currentQuestion]}
                        </h2>

                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <button
                                    key={`${currentQuestion}-${option.value}`}
                                    onClick={() => handleAnswer(option.value)}
                                    className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                                >
                                    <span className="text-primaryTextColor font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full bg-darkThemeColor rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-secondaryTextColor">
                                پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                            </span>
                            <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                ></div>
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