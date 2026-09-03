"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaLightbulb } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ttct");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "ایده‌های جدید و خلاقانه به ذهنم می‌آید",
        "می‌توانم راه‌حل‌های مختلفی برای یک مشکل پیدا کنم",
        "ایده‌های من معمولاً منحصر به فرد و غیرمعمول هستند",
        "می‌توانم جزئیات مهم یک ایده را کامل کنم",
        "از تجربیات جدید و متفاوت لذت می‌برم",
        "می‌توانم بین موضوعات مختلف ارتباط برقرار کنم",
        "از حل مسائل پیچیده لذت می‌برم",
        "می‌توانم از زوایای مختلف به یک موضوع نگاه کنم",
        "از آزمایش و تجربه کردن نمی‌ترسم"
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
        const maxScore = 45;
        
        if (score <= 18) {
            return {
                level: "پایین",
                color: "#dc2626",
                desc: "خلاقیت در سطح پایین است.",
                details: "مهارت‌های خلاقانه شما نیاز به توسعه دارد. شما می‌توانید با تمرین و یادگیری، خلاقیت خود را تقویت کنید.",
                strengths: [
                    "پتانسیل برای رشد"
                ],
                recommendations: [
                    "تمرین تفکر خلاق",
                    "یادگیری تکنیک‌های خلاقیت",
                    "تجربه چیزهای جدید",
                    "یادگیری از دیگران",
                    "تمرین حل مسئله خلاقانه"
                ]
            };
        } else if (score <= 32) {
            return {
                level: "متوسط",
                color: "#eab308",
                desc: "خلاقیت در سطح متوسط است.",
                details: "شما برخی مهارت‌های خلاقانه را دارید، اما می‌توانید آن‌ها را تقویت کنید.",
                strengths: [
                    "برخی مهارت‌های خلاقانه",
                    "پتانسیل رشد"
                ],
                recommendations: [
                    "تقویت مهارت‌های موجود",
                    "تمرین منظم",
                    "یادگیری تکنیک‌های جدید",
                    "تجربه چیزهای جدید",
                    "همکاری با افراد خلاق"
                ]
            };
        } else {
            return {
                level: "بالا",
                color: "#22c55e",
                desc: "خلاقیت در سطح بالا است.",
                details: "شما از خلاقیت بالایی برخوردارید. شما می‌توانید ایده‌های جدید ایجاد کنید و از زوایای مختلف به مسائل نگاه کنید.",
                strengths: [
                    "تفکر خلاق قوی",
                    "توانایی ایجاد ایده‌های جدید",
                    "انعطاف فکری",
                    "توانایی حل مسئله خلاقانه",
                    "نوآوری"
                ],
                recommendations: [
                    "حفظ و تقویت خلاقیت",
                    "کمک به دیگران در رشد خلاقیت",
                    "ادامه تجربه چیزهای جدید",
                    "به اشتراک گذاری ایده‌ها",
                    "پروژه‌های خلاقانه"
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
        const maxScore = 45;

        const chartData = {
            labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
            datasets: [{
                label: 'خلاقیت',
                data: [score, 18, 32, 45],
                backgroundColor: [
                    interpretation.color + 'B3',
                    'rgba(220, 38, 38, 0.3)',
                    'rgba(234, 179, 8, 0.3)',
                    'rgba(34, 197, 94, 0.3)'
                ],
                borderColor: [
                    interpretation.color,
                    'rgb(220, 38, 38)',
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
                                <FaLightbulb className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست خلاقیت تورنس</h1>
                                <p className="text-secondaryTextColor">ارزیابی سطح خلاقیت و تفکر خلاقانه شما</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمره شما</h3>
                                <div className="text-4xl font-bold text-primaryThemeColor mb-2">{score}</div>
                                <div className="text-sm text-secondaryTextColor">از 45</div>
                            </div>

                            <div className="bg-darkThemeColor rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">سطح خلاقیت</h3>
                                <div className="text-lg font-medium" style={{ color: interpretation.color }}>{interpretation.level}</div>
                                <div className="text-sm text-secondaryTextColor mt-2">{interpretation.desc}</div>
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
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار خلاقیت</h3>
                            <div className="w-full h-80">
                                <Bar data={chartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'تحلیل خلاقیت', color: '#e5e7eb', font: { size: 16 } }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: 45, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                                        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
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
                                        <span className="text-secondaryTextColor text-sm">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">راهنمایی‌های اضافی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">توسعه خلاقیت</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• تمرین روزانه تولید ایده</li>
                                        <li>• مطالعه کتاب‌های خلاقیت</li>
                                        <li>• شرکت در کارگاه‌های خلاقیت</li>
                                        <li>• تمرین حل مسائل پیچیده</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">حفظ خلاقیت</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• حفظ کنجکاوی</li>
                                        <li>• تجربه چیزهای جدید</li>
                                        <li>• ارتباط با افراد خلاق</li>
                                        <li>• تمرین مداوم</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
                            <h4 className="font-medium text-blue-400 mb-2">💡 نکته مهم</h4>
                            <p className="text-sm text-blue-300">
                                خلاقیت یکی از مهم‌ترین مهارت‌های قرن 21 است که در همه زمینه‌های زندگی کاربرد دارد.
                                حفظ و تقویت خلاقیت برای موفقیت در کار و زندگی ضروری است.
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
                            <FaLightbulb className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست خلاقیت تورنس</h1>
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