"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartBroken } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("trauma_symptoms");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "خاطرات ناراحت‌کننده از رویدادهای گذشته به ذهنم می‌آید",
        "رویاهای ناراحت‌کننده و ترسناک می‌بینم",
        "احساس می‌کنم که رویداد ناراحت‌کننده دوباره اتفاق می‌افتد",
        "وقتی چیزی یادآور رویداد ناراحت‌کننده می‌شود، احساس ناراحتی شدید می‌کنم",
        "از چیزهایی که یادآور رویداد ناراحت‌کننده است اجتناب می‌کنم",
        "نمی‌توانم جزئیات مهم رویداد ناراحت‌کننده را به یاد بیاورم",
        "احساس می‌کنم که از دیگران جدا شده‌ام",
        "احساس می‌کنم که آینده‌ای ندارم",
        "مشکل در خوابیدن دارم",
        "احساس تحریک‌پذیری و عصبانیت می‌کنم",
        "مشکل در تمرکز دارم",
        "احساس هوشیاری بیش از حد می‌کنم",
        "به راحتی می‌ترسم",
        "احساس گناه یا شرم می‌کنم",
        "احساس بی‌حسی عاطفی می‌کنم",
        "علاقه‌ام به فعالیت‌هایی که قبلاً لذت‌بخش بود کاهش یافته",
        "احساس می‌کنم که نمی‌توانم به دیگران اعتماد کنم",
        "احساس می‌کنم که کنترل کمی بر زندگی خود دارم",
        "احساس می‌کنم که در خطر هستم",
        "احساس می‌کنم که نمی‌توانم با دیگران ارتباط برقرار کنم",
        "احساس می‌کنم که نمی‌توانم احساسات خود را بیان کنم",
        "احساس می‌کنم که نمی‌توانم تصمیم‌گیری کنم",
        "احساس می‌کنم که نمی‌توانم به آینده فکر کنم",
        "احساس می‌کنم که نمی‌توانم از زندگی لذت ببرم",
        "احساس می‌کنم که نمی‌توانم با استرس کنار بیایم"
    ];

    const options = [
        { value: 0, label: "هرگز" },
        { value: 1, label: "به ندرت" },
        { value: 2, label: "گاهی اوقات" },
        { value: 3, label: "اغلب" },
        { value: 4, label: "همیشه" }
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
        const maxScore = 100;
        
        if (score <= 25) {
            return {
                level: "کم/طبیعی",
                color: "#22c55e",
                desc: "علائم تروما در حد طبیعی است.",
                details: "نمره شما نشان می‌دهد که علائم تروما در حد طبیعی یا کم است. این یک نشانه مثبت است.",
                strengths: [
                    "عملکرد مناسب",
                    "عدم اختلال در زندگی روزمره",
                    "کنترل خوب احساسات",
                    "روابط سالم"
                ],
                recommendations: [
                    "حفظ این وضعیت",
                    "استراتژی‌های مقابله سالم",
                    "حمایت اجتماعی",
                    "مراقبت از خود"
                ]
            };
        } else if (score <= 50) {
            return {
                level: "متوسط",
                color: "#eab308",
                desc: "برخی علائم تروما وجود دارد.",
                details: "برخی علائم تروما در شما مشاهده می‌شود که ممکن است بر عملکرد شما تأثیر بگذارد. کار با یک متخصص می‌تواند کمک کند.",
                strengths: [
                    "برخی مهارت‌های مقابله",
                    "آگاهی از مشکل"
                ],
                recommendations: [
                    "درمان تروما (EMDR، TF-CBT)",
                    "مدیریت استرس",
                    "ذهن‌آگاهی",
                    "گروه‌های حمایتی",
                    "کار با درمانگر متخصص تروما"
                ]
            };
        } else if (score <= 75) {
            return {
                level: "شدید",
                color: "#f97316",
                desc: "علائم تروما شدید است و نیاز به درمان دارد.",
                details: "علائم تروما در شما شدید است و تأثیر قابل توجهی بر زندگی، کار و روابط شما می‌گذارد. درمان تخصصی فوری توصیه می‌شود.",
                strengths: [
                    "شناسایی مشکل"
                ],
                recommendations: [
                    "درمان تخصصی تروما فوری",
                    "TF-CBT یا EMDR",
                    "درمان دارویی در صورت نیاز (با تجویز پزشک)",
                    "گروه‌های حمایتی",
                    "مدیریت بحران",
                    "مراقبت از خود فشرده"
                ]
            };
        } else {
            return {
                level: "بسیار شدید",
                color: "#dc2626",
                desc: "علائم تروما بسیار شدید است - درمان فوری ضروری است.",
                details: "علائم تروما در شما بسیار شدید است و به شدت بر همه جنبه‌های زندگی شما تأثیر می‌گذارد. درمان فوری و جامع چندرشته‌ای ضروری است.",
                strengths: [
                    "شناسایی مشکل"
                ],
                recommendations: [
                    "درمان تخصصی فوری و فشرده",
                    "TF-CBT یا EMDR با درمانگر متخصص",
                    "درمان دارویی (با تجویز پزشک)",
                    "مدیریت بحران و ایمنی",
                    "بستری احتمالی در صورت نیاز",
                    "حمایت خانواده",
                    "پیگیری منظم و نزدیک"
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
        const maxScore = 100;

    const chartData = {
      labels: ['نمره شما', 'طبیعی', 'متوسط', 'شدید', 'بسیار شدید'],
      datasets: [{
        label: 'علائم تروما',
        data: [score, 25, 50, 75, 100],
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
                <Header />
                <MobileHeader />

                <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                    <Sidebar />

                    <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                                <FaHeartBroken className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست علائم تروما</h1>
                                <p className="text-secondaryTextColor">ارزیابی علائم تروما و PTSD شما</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره شما</h3>
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

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
                            <div className="w-full h-80">
                                <Bar data={chartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'تحلیل نمره علائم تروما', color: '#e5e7eb', font: { size: 16 } }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                                        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                                    }
                                }} />
                            </div>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">راهنمایی‌های اضافی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">روش‌های درمان</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• درمان شناختی-رفتاری (CBT)</li>
                                        <li>• درمان پردازش حساسیت‌زدایی حرکات چشم (EMDR)</li>
                                        <li>• درمان مواجهه‌ای</li>
                                        <li>• درمان گروهی</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">راه‌های مقابله</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• تکنیک‌های آرام‌سازی</li>
                                        <li>• تمرین تنفس عمیق</li>
                                        <li>• مدیتیشن و ذهن‌آگاهی</li>
                                        <li>• حمایت اجتماعی</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
                            <h4 className="font-medium text-red-400 mb-2">⚠️ هشدار مهم</h4>
                            <p className="text-sm text-red-300">
                                اگر افکار خودکشی، رفتارهای خودآسیبی یا مصرف مواد مخدر دارید،
                                فوراً با اورژانس (115) یا مرکز بحران تماس بگیرید.
                            </p>
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
                            <FaHeartBroken className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست علائم تروما</h1>
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










