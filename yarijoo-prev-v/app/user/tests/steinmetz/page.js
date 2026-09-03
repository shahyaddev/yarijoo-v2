"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaCloudMeatball } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("steinmetz");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "در محل کار احساس فشار و استرس می‌کنم",
        "مشکلات کاری باعث نگرانی من می‌شود",
        "احساس می‌کنم که کارم بیش از حد توان من است",
        "در محل کار احساس خستگی و فرسودگی می‌کنم",
        "مشکلات کاری بر خواب من تأثیر می‌گذارد",
        "احساس می‌کنم که کنترل کمی بر کارم دارم",
        "در محل کار احساس اضطراب و نگرانی می‌کنم",
        "مشکلات کاری باعث سردرد و دردهای جسمی می‌شود",
        "احساس می‌کنم که کارم بر زندگی شخصی من تأثیر منفی می‌گذارد",
        "در محل کار احساس ناامیدی و درماندگی می‌کنم",
        "مشکلات کاری باعث تحریک‌پذیری و عصبانیت می‌شود",
        "احساس می‌کنم که کارم ارزش و معنا ندارد",
        "در محل کار احساس انزوا و تنهایی می‌کنم",
        "مشکلات کاری باعث مشکل در تمرکز می‌شود",
        "احساس می‌کنم که کارم بر روابط من تأثیر منفی می‌گذارد",
        "در محل کار احساس بی‌ارزشی و بی‌کفایتی می‌کنم",
        "مشکلات کاری باعث مشکل در تصمیم‌گیری می‌شود",
        "احساس می‌کنم که کارم بر سلامت جسمی من تأثیر منفی می‌گذارد",
        "در محل کار احساس فشار برای انجام کارهای اضافی می‌کنم",
        "مشکلات کاری باعث مشکل در خوابیدن می‌شود"
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
    const maxScore = 100;
    const percentage = (score / maxScore) * 100;
    
    if (percentage < 30) {
      return {
        level: "سطح پایین",
        color: "#22c55e",
        desc: "نمره شما نشان می‌دهد که در این زمینه وضعیت خوبی دارید و علائم کمی مشاهده می‌شود.",
        details: "بر اساس پاسخ‌های شما، به نظر می‌رسد که در این حوزه عملکرد مناسبی دارید. این یک نشانه مثبت است و نشان‌دهنده سلامت روانی خوب در این بعد می‌باشد. با این حال، مهم است که به حفظ این وضعیت ادامه دهید و در صورت بروز هرگونه تغییر، به آن توجه کنید.",
        strengths: [
          "عملکرد مناسب در این حوزه",
          "نشانه‌های سلامت روانی مطلوب",
          "توانایی مقابله با چالش‌های روزمره",
          "کیفیت زندگی خوب",
          "سازگاری مناسب با محیط"
],
        recommendations: [
          "ادامه شیوه زندگی فعلی و حفظ عادت‌های سالم",
          "توجه به علائم هشداردهنده و تغییرات احتمالی",
          "حفظ تعادل بین کار، استراحت و تفریح",
          "تقویت روابط اجتماعی و حمایت خانوادگی",
          "مراقبت منظم از سلامت جسمی و روانی"
]
      };

    } else {
      return {
        level: "سطح متوسط",
        color: "#eab308",
        desc: "نمره شما در محدوده متوسط قرار دارد.",
        details: "بر اساس پاسخ‌های شما، عملکرد شما در این حوزه در حد متوسط است.",
        strengths: [],
        recommendations: [
          "تمرین تکنیک‌های بهبود عملکرد",
          "مشاوره با متخصص برای ارزیابی دقیق‌تر",
          "برنامه‌ریزی برای بهبود",
          "حفظ انگیزه و تلاش مستمر"
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
        const recommendations = getRecommendations(score);

        return (
            <div className="w-full flex flex-col items-center">
                <Header />
                <MobileHeader />

                <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                    <Sidebar />

                    <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                                <FaCloudMeatball className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست استرس شغلی استاینمتز</h1>
                                <p className="text-secondaryTextColor">ارزیابی استرس شغلی شما</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمره شما</h3>
                                <div className="text-4xl font-bold text-primaryThemeColor mb-2">{score}</div>
                                <div className="text-sm text-secondaryTextColor">از 100</div>
                            </div>

                            <div className="bg-darkThemeColor rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر</h3>
                                <div className="text-lg font-medium text-primaryThemeColor">{interpretation}</div>
                            </div>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌ها</h3>
                            <ul className="space-y-2">
                                {recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                                        <span className="text-secondaryTextColor">{rec}</span>
                                    </li>
                                ))}
                            </ul>
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
                            <FaCloudMeatball className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست استرس شغلی استاینمتز</h1>
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
