"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaRocket } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("tyl");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "من همیشه سعی می‌کنم بهترین عملکرد را داشته باشم",
        "از چالش‌های جدید استقبال می‌کنم",
        "معمولاً اهداف بلندپروازانه برای خود تعیین می‌کنم",
        "وقتی کاری را شروع می‌کنم، تا پایان آن را ادامه می‌دهم",
        "از شکست نمی‌ترسم و آن را فرصتی برای یادگیری می‌دانم",
        "همیشه به دنبال راه‌های بهتر برای انجام کارها هستم",
        "از کارهای سخت و پیچیده لذت می‌برم",
        "معمولاً از حد انتظارات فراتر می‌روم",
        "از رقابت با دیگران لذت می‌برم",
        "همیشه به دنبال یادگیری چیزهای جدید هستم",
        "از کارهای تیمی و همکاری لذت می‌برم",
        "معمولاً ایده‌های خلاقانه و نوآورانه دارم",
        "از کارهای رهبری و مدیریت لذت می‌برم",
        "همیشه به دنبال فرصت‌های جدید برای رشد هستم",
        "از کارهای پراسترس و چالش‌برانگیز لذت می‌برم",
        "معمولاً اهداف کوتاه‌مدت و بلندمدت تعیین می‌کنم",
        "از کارهای تکنیکی و فنی لذت می‌برم",
        "همیشه به دنبال بازخورد و نظرات دیگران هستم",
        "از کارهای تحقیقاتی و تحلیلی لذت می‌برم",
        "معمولاً ایده‌های خود را به عمل تبدیل می‌کنم",
        "از کارهای هنری و خلاقانه لذت می‌برم",
        "همیشه به دنبال راه‌های جدید برای حل مسائل هستم",
        "از کارهای ورزشی و فیزیکی لذت می‌برم",
        "معمولاً ایده‌های خود را با دیگران به اشتراک می‌گذارم",
        "از کارهای اجتماعی و ارتباطی لذت می‌برم"
    ];

    const options = [
        { value: 1, label: "کاملاً مخالفم" },
        { value: 2, label: "مخالفم" },
        { value: 3, label: "نظری ندارم" },
        { value: 4, label: "موافقم" },
        { value: 5, label: "کاملاً موافقم" }
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
                level: "پایین",
                color: "#dc2626",
                desc: "انگیزه شما برای رسیدن به اهداف پایین است.",
                details: "شما انگیزه محدودی برای تعیین و رسیدن به اهداف دارید. این می‌تواند بر موفقیت شما در کار و زندگی تأثیر بگذارد.",
                strengths: [
                    "پتانسیل برای بهبود"
                ],
                recommendations: [
                    "تعیین اهداف کوچک و قابل دستیابی",
                    "یافتن انگیزه‌های شخصی",
                    "جستجوی الهام",
                    "ایجاد عادت‌های مثبت",
                    "حمایت از دیگران"
                ]
            };
        } else if (score <= 90) {
            return {
                level: "متوسط",
                color: "#eab308",
                desc: "انگیزه شما برای رسیدن به اهداف متوسط است.",
                details: "شما انگیزه نسبی برای تعیین و دنبال کردن اهداف دارید، اما می‌توانید آن را تقویت کنید.",
                strengths: [
                    "برخی انگیزه پایه",
                    "تمایل به پیشرفت"
                ],
                recommendations: [
                    "تقویت انگیزه موجود",
                    "تعیین اهداف واضح‌تر",
                    "برنامه‌ریزی بهتر",
                    "یافتن منابع انگیزه",
                    "جستجوی چالش‌های جدید"
                ]
            };
        } else {
            return {
                level: "بالا",
                color: "#22c55e",
                desc: "انگیزه شما برای رسیدن به اهداف بالا است.",
                details: "شما از انگیزه بالایی برای تعیین و رسیدن به اهداف برخوردارید. شما اهداف بلندپروازانه دارید و برای دستیابی به آن‌ها تلاش می‌کنید.",
                strengths: [
                    "انگیزه قوی",
                    "تعیین اهداف بلندپروازانه",
                    "پشتکار بالا",
                    "آمادگی برای چالش‌ها",
                    "یادگیری مستمر"
                ],
                recommendations: [
                    "حفظ این سطح انگیزه",
                    "کمک به دیگران",
                    "تعیین اهداف جدید",
                    "ادامه رشد",
                    "به اشتراک گذاری انگیزه"
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

        return (
            <div className="w-full flex flex-col items-center">
                <Header />
                <MobileHeader />

                <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                    <Sidebar />

                    <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                                <FaRocket className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست انگیزه و محدودیت‌ها</h1>
                                <p className="text-secondaryTextColor">ارزیابی انگیزه و تمایل به رسیدن به اهداف شما</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمره شما</h3>
                                <div className="text-4xl font-bold text-primaryThemeColor mb-2">{score}</div>
                                <div className="text-sm text-secondaryTextColor">از 125</div>
                            </div>

                            <div className="bg-darkThemeColor rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">سطح انگیزه</h3>
                                <div className="text-lg font-medium" style={{ color: interpretation.color }}>{interpretation.level}</div>
                                <div className="text-sm text-secondaryTextColor mt-2">{interpretation.desc}</div>
                            </div>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
                            <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.details}</p>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                            <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                                {interpretation.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌ها</h3>
                            <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                                {interpretation.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">راهنمایی‌های اضافی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">توسعه انگیزه</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• تعیین اهداف واضح و قابل دستیابی</li>
                                        <li>• جستجوی انگیزه‌های شخصی</li>
                                        <li>• تمرین روزانه برای ایجاد عادت‌های مثبت</li>
                                        <li>• جستجوی حمایت از دیگران</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">حفظ انگیزه</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• حفظ و تقویت انگیزه موجود</li>
                                        <li>• تعیین اهداف چالش‌برانگیز</li>
                                        <li>• جستجوی فرصت‌های جدید</li>
                                        <li>• کمک به دیگران در بهبود انگیزه</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
                            <h4 className="font-medium text-blue-400 mb-2">🚀 نکته مهم</h4>
                            <p className="text-sm text-blue-300">
                                انگیزه یکی از مهم‌ترین عوامل در رسیدن به اهداف و موفقیت در زندگی است.
                                حفظ و تقویت انگیزه برای موفقیت در کار و زندگی ضروری است.
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
                            <FaRocket className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست انگیزه و محدودیت‌ها</h1>
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








