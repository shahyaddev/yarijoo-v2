"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaTicketAlt } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ticket");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "من معمولاً در صف‌ها صبر می‌کنم تا نوبت من برسد",
        "در خرید بلیط‌های رویدادها و کنسرت‌ها مهارت دارم",
        "قبل از خرید بلیط، قیمت‌ها را مقایسه می‌کنم",
        "در استفاده از سیستم‌های آنلاین خرید بلیط مهارت دارم",
        "معمولاً بلیط‌های خود را از قبل رزرو می‌کنم",
        "در پیدا کردن تخفیف‌ها و پیشنهادات ویژه مهارت دارم",
        "معمولاً بلیط‌های خود را در زمان مناسب خریداری می‌کنم",
        "در انتخاب صندلی مناسب مهارت دارم",
        "معمولاً بلیط‌های خود را از منابع معتبر خریداری می‌کنم",
        "در مدیریت بلیط‌های خود و نگهداری آن‌ها مهارت دارم",
        "معمولاً بلیط‌های خود را به موقع استفاده می‌کنم",
        "در حل مشکلات مربوط به بلیط‌ها مهارت دارم",
        "معمولاً بلیط‌های خود را با دیگران به اشتراک می‌گذارم",
        "در انتخاب رویدادهای مناسب برای شرکت مهارت دارم",
        "معمولاً بلیط‌های خود را با برنامه‌ریزی خریداری می‌کنم",
        "در استفاده از کارت‌های اعتباری برای خرید بلیط مهارت دارم",
        "معمولاً بلیط‌های خود را در مکان‌های امن نگهداری می‌کنم",
        "در پیدا کردن جایگزین برای بلیط‌های لغو شده مهارت دارم",
        "معمولاً بلیط‌های خود را با دوستان و خانواده هماهنگ می‌کنم",
        "در استفاده از اپلیکیشن‌های خرید بلیط مهارت دارم",
        "معمولاً بلیط‌های خود را با توجه به بودجه خریداری می‌کنم",
        "در انتخاب زمان مناسب برای خرید بلیط مهارت دارم",
        "معمولاً بلیط‌های خود را با اطلاعات کامل خریداری می‌کنم",
        "در مدیریت بلیط‌های گروهی مهارت دارم",
        "معمولاً بلیط‌های خود را با اطمینان خریداری می‌کنم"
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
                level: "پایین",
                color: "#dc2626",
                desc: "مهارت‌های مدیریت بلیط پایین است.",
                details: "مهارت‌های شما در مدیریت و خرید بلیط نیاز به بهبود دارد. با یادگیری و تمرین می‌توانید این مهارت‌ها را تقویت کنید.",
                strengths: [
                    "پتانسیل برای بهبود"
                ],
                recommendations: [
                    "یادگیری استفاده از سیستم‌های آنلاین",
                    "مقایسه قیمت‌ها",
                    "برنامه‌ریزی برای خرید بلیط",
                    "یادگیری استفاده از اپلیکیشن‌ها",
                    "مشاوره از دیگران"
                ]
            };
        } else if (score <= 90) {
            return {
                level: "متوسط",
                color: "#eab308",
                desc: "مهارت‌های مدیریت بلیط در سطح متوسط است.",
                details: "شما برخی مهارت‌های مدیریت بلیط را دارید، اما می‌توانید آن‌ها را تقویت کنید.",
                strengths: [
                    "برخی مهارت‌های پایه",
                    "توانایی نسبی"
                ],
                recommendations: [
                    "تقویت مهارت‌های موجود",
                    "یادگیری تکنیک‌های جدید",
                    "بهبود برنامه‌ریزی",
                    "یافتن تخفیف‌ها و پیشنهادات"
                ]
            };
        } else {
            return {
                level: "بالا",
                color: "#22c55e",
                desc: "مهارت‌های مدیریت بلیط خوب است.",
                details: "شما از مهارت‌های خوبی در مدیریت و خرید بلیط برخوردارید. شما می‌توانید به طور مؤثر بلیط‌ها را مدیریت کنید.",
                strengths: [
                    "مهارت‌های مدیریتی خوب",
                    "برنامه‌ریزی مؤثر",
                    "توانایی یافتن بهترین قیمت‌ها",
                    "استفاده مناسب از تکنولوژی",
                    "مدیریت مالی مناسب"
                ],
                recommendations: [
                    "حفظ این سطح",
                    "کمک به دیگران",
                    "ادامه یادگیری",
                    "به اشتراک گذاری تجربیات"
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
            labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
            datasets: [{
                label: 'مهارت مدیریت بلیط',
                data: [score, 50, 90, 125],
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
                                <FaTicketAlt className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست مهارت خرید بلیط</h1>
                                <p className="text-secondaryTextColor">ارزیابی مهارت خرید و مدیریت بلیط شما</p>
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
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">سطح مهارت</h3>
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
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار مهارت</h3>
                            <div className="w-full h-80">
                                <Bar data={chartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'تحلیل مهارت مدیریت بلیط', color: '#e5e7eb', font: { size: 16 } }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: 125, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
                                    <h4 className="font-medium text-primaryTextColor mb-2">مهارت‌های کلیدی</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• مهارت‌های آنلاین</li>
                                        <li>• برنامه‌ریزی و زمان‌بندی</li>
                                        <li>• مقایسه قیمت‌ها</li>
                                        <li>• شناسایی تخفیف‌ها</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">نکات مهم</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• خرید از منابع معتبر</li>
                                        <li>• بررسی شرایط لغو</li>
                                        <li>• هماهنگی با دیگران</li>
                                        <li>• نگهداری امن بلیط‌ها</li>
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
                            <FaTicketAlt className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست مهارت خرید بلیط</h1>
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












