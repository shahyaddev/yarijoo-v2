"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaClock } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("time_management");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "من معمولاً برنامه روزانه خود را از قبل تنظیم می‌کنم",
        "در تعیین اولویت‌های کاری مهارت دارم",
        "معمولاً کارهای مهم را در اولویت قرار می‌دهم",
        "در تخمین زمان مورد نیاز برای انجام کارها مهارت دارم",
        "معمولاً کارهای خود را به موقع تمام می‌کنم",
        "در استفاده از تکنیک‌های مدیریت زمان مهارت دارم",
        "معمولاً وقفه‌ها و حواس‌پرتی‌ها را کنترل می‌کنم",
        "در تقسیم کارهای بزرگ به بخش‌های کوچک مهارت دارم",
        "معمولاً اهداف کوتاه‌مدت و بلندمدت تعیین می‌کنم",
        "در استفاده از تقویم و برنامه‌ریزی دیجیتال مهارت دارم",
        "معمولاً زمان‌های استراحت را در برنامه خود قرار می‌دهم",
        "در مدیریت ایمیل‌ها و پیام‌ها مهارت دارم",
        "معمولاً کارهای غیرضروری را حذف می‌کنم",
        "در استفاده از تکنیک پومودورو مهارت دارم",
        "معمولاً کارهای مشابه را با هم انجام می‌دهم",
        "در تعیین مهلت‌های واقع‌بینانه مهارت دارم",
        "معمولاً کارهای خود را به صورت منظم بررسی می‌کنم",
        "در استفاده از لیست کارها (To-Do List) مهارت دارم",
        "معمولاً کارهای خود را بر اساس انرژی‌ام انجام می‌دهم",
        "در استفاده از تکنیک‌های تفویض اختیار مهارت دارم",
        "معمولاً کارهای خود را بر اساس اهمیت و فوریت دسته‌بندی می‌کنم",
        "در استفاده از تکنیک‌های تمرکز مهارت دارم",
        "معمولاً کارهای خود را بر اساس زمان‌بندی انجام می‌دهم",
        "در استفاده از تکنیک‌های کاهش استرس مهارت دارم",
        "معمولاً کارهای خود را بر اساس اهداف بلندمدت انجام می‌دهم"
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
    const maxScore = 120;
    
    if (score <= 48) {
      return {
        level: "مدیریت زمان ضعیف",
        color: "#ef4444",
        desc: "مهارت‌های مدیریت زمان شما ضعیف است. نیاز به بهبود فوری دارید.",
        details: "نمره پایین شما نشان می‌دهد که در مدیریت زمان و اولویت‌بندی کارها مشکل دارید. این می‌تواند منجر به استرس، خستگی و کاهش عملکرد شود.",
        strengths: [],
        recommendations: [
          "**آموزش مدیریت زمان**: شرکت در دوره‌های مدیریت زمان",
          "**اولویت‌بندی**: یادگیری ماتریس آیزنهاور (فوری/مهم)",
          "**برنامه‌ریزی روزانه**: تنظیم برنامه روزانه",
          "**تکنیک پومودورو**: استفاده از 25 دقیقه کار + 5 دقیقه استراحت",
          "**حذف حواس‌پرتی**: خاموش کردن نوتیفیکیشن‌ها",
          "**تعیین مهلت**: تعیین مهلت واقع‌بینانه برای کارها",
          "**تفویض اختیار**: یادگیری تفویض کارها به دیگران",
          "**بررسی منظم**: بررسی هفتگی برنامه و عملکرد"
        ]
      };
    } else if (score <= 80) {
      return {
        level: "مدیریت زمان متوسط",
        color: "#eab308",
        desc: "مهارت‌های مدیریت زمان شما متوسط است. با بهبود می‌توانید بهتر شوید.",
        details: "شما برخی مهارت‌های مدیریت زمان را دارید اما نیاز به تقویت دارید. با یادگیری تکنیک‌های بیشتر می‌توانید عملکرد خود را بهبود دهید.",
        strengths: ["برخی مهارت‌های اولیه", "آگاهی از اهمیت مدیریت زمان"],
        recommendations: [
          "**تقویت برنامه‌ریزی**: بهبود برنامه‌ریزی روزانه",
          "**اولویت‌بندی بهتر**: تمرکز بر کارهای مهم",
          "**تکنیک‌های جدید**: یادگیری تکنیک‌های پیشرفته",
          "**حذف اتلاف وقت**: شناسایی و حذف عوامل اتلاف وقت",
          "**بررسی عملکرد**: بررسی منظم عملکرد"
        ]
      };
    } else {
      return {
        level: "مدیریت زمان عالی",
        color: "#22c55e",
        desc: "مهارت‌های مدیریت زمان شما عالی است. به خوبی از زمان استفاده می‌کنید.",
        details: "شما مهارت‌های مدیریت زمان عالی دارید و می‌توانید به خوبی از زمان استفاده کنید. این می‌تواند منجر به افزایش بهره‌وری و کاهش استرس شود.",
        strengths: ["برنامه‌ریزی عالی", "اولویت‌بندی مناسب", "کنترل حواس‌پرتی", "بهره‌وری بالا"],
        recommendations: [
          "**حفظ این سطح**: ادامه استفاده از مهارت‌های فعلی",
          "**به اشتراک گذاری**: آموزش به دیگران",
          "**بهبود مستمر**: یادگیری تکنیک‌های جدید"
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

        const chartData = {
            labels: ['نمره شما', 'ضعیف (25-48)', 'متوسط (49-80)', 'عالی (81-125)'],
            datasets: [{
                label: 'نمره مدیریت زمان',
                data: [score, 48, 80, 125],
                backgroundColor: [
                    interpretation.color + 'B3',
                    'rgba(239, 68, 68, 0.3)',
                    'rgba(234, 179, 8, 0.3)',
                    'rgba(34, 197, 94, 0.3)'
                ],
                borderColor: [
                    interpretation.color,
                    'rgb(239, 68, 68)',
                    'rgb(234, 179, 8)',
                    'rgb(34, 197, 94)'
                ],
                borderWidth: 2
            }]
        };

        return (
            <div className="w-full flex flex-col items-center">
                <Header />
                <MobileHeader />

                <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                    <Sidebar />

                    <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                                <FaClock className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست مدیریت زمان</h1>
                                <p className="text-secondaryTextColor">ارزیابی مهارت مدیریت زمان و برنامه‌ریزی شما</p>
                            </div>
                        </div>

                        <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                            <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح مهارت مدیریت زمان</h3>
                            <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                            <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
                            <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-darkThemeColor rounded-2xl p-6">
                                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
                            </div>
                            <div className="bg-darkThemeColor rounded-2xl p-6">
                                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">محدوده نمره</h3>
                                <div className="text-lg font-semibold mb-1 text-secondaryTextColor">
                                    {score <= 48 ? "25-48 (ضعیف)" : score <= 80 ? "49-80 (متوسط)" : "81-125 (عالی)"}
                                </div>
                            </div>
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
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
                            <div className="w-full h-80">
                                <Bar data={chartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'تحلیل نمره مدیریت زمان', color: '#e5e7eb', font: { size: 16 } }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                                        x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                                    }
                                }} />
                            </div>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
                            <ul className="space-y-3">
                                {interpretation.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                                        <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تکنیک‌های مدیریت زمان</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">تکنیک‌های اساسی</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• تکنیک پومودورو (25 دقیقه کار، 5 دقیقه استراحت)</li>
                                        <li>• ماتریس آیزنهاور (مهم/فوری)</li>
                                        <li>• تکنیک GTD (Getting Things Done)</li>
                                        <li>• تکنیک ABC (اولویت‌بندی)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">ابزارهای دیجیتال</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• تقویم‌های دیجیتال (Google Calendar)</li>
                                        <li>• اپلیکیشن‌های To-Do (Todoist)</li>
                                        <li>• ابزارهای مدیریت پروژه (Trello)</li>
                                        <li>• اپلیکیشن‌های تمرکز (Forest)</li>
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
                            <FaClock className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست مدیریت زمان</h1>
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










