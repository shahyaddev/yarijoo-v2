"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUsers } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("team_role");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "من معمولاً رهبری گروه را بر عهده می‌گیرم",
        "در حل مشکلات تیمی مهارت دارم",
        "ایده‌های خلاقانه برای تیم ارائه می‌دهم",
        "در هماهنگی و سازماندهی کارهای تیم مؤثر هستم",
        "به اعضای تیم کمک می‌کنم تا مهارت‌هایشان را بهبود بخشند",
        "در تصمیم‌گیری‌های تیمی مشارکت فعال دارم",
        "در حل تعارضات بین اعضای تیم مهارت دارم",
        "اطلاعات و دانش خود را با تیم به اشتراک می‌گذارم",
        "در انجام کارهای عملی و اجرایی مهارت دارم",
        "در برقراری ارتباط مؤثر با اعضای تیم مهارت دارم",
        "در تحلیل و ارزیابی پروژه‌های تیمی مهارت دارم",
        "در ایجاد انگیزه و روحیه در تیم مؤثر هستم",
        "در مدیریت زمان و منابع تیم مهارت دارم",
        "در ارائه گزارش‌ها و ارائه‌های تیمی مهارت دارم",
        "در ایجاد هماهنگی بین اعضای تیم مؤثر هستم",
        "در شناسایی و استفاده از نقاط قوت اعضای تیم مهارت دارم",
        "در ایجاد محیط کاری مثبت و سازنده مؤثر هستم",
        "در مدیریت تغییرات و تحولات تیمی مهارت دارم",
        "در ایجاد اعتماد و روابط قوی با اعضای تیم مؤثر هستم",
        "در ارزیابی عملکرد و ارائه بازخورد مؤثر هستم",
        "در ایجاد چشم‌انداز و استراتژی برای تیم مهارت دارم",
        "در مدیریت ریسک‌ها و چالش‌های تیمی مهارت دارم",
        "در ایجاد فرهنگ یادگیری و رشد در تیم مؤثر هستم",
        "در ایجاد تعادل بین کار و زندگی برای اعضای تیم مؤثر هستم",
        "در ایجاد نوآوری و خلاقیت در تیم مؤثر هستم"
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
        level: "نقش تیمی ضعیف",
        color: "#ef4444",
        desc: "مشارکت شما در تیم در سطح پایینی است. نیاز به بهبود مهارت‌های تیمی دارید.",
        details: "نمره شما نشان می‌دهد که در کار تیمی با چالش مواجه هستید. این می‌تواند به دلیل کمبود مهارت‌های تیمی، اعتماد به نفس پایین یا تجربه محدود باشد.",
        strengths: [],
        recommendations: [
          "**یادگیری مهارت‌های تیمی**: آموزش مهارت‌های کار تیمی",
          "**مشارکت فعال**: افزایش مشارکت در فعالیت‌های تیمی",
          "**شناسایی نقاط قوت**: شناسایی نقاط قوت خود در تیم",
          "**برقراری ارتباط**: بهبود ارتباط با اعضای تیم",
          "**دریافت بازخورد**: درخواست بازخورد از هم‌تیمی‌ها",
          "**شروع کوچک**: شروع با نقش‌های کوچکتر در تیم",
          "**مشاهده**: یادگیری از اعضای موفق تیم"
        ]
      };
    } else if (score <= 87) {
      return {
        level: "نقش تیمی متوسط",
        color: "#eab308",
        desc: "مشارکت شما در تیم در سطح متوسط است. با بهبود می‌توانید مؤثرتر باشید.",
        details: "شما در برخی جنبه‌های کار تیمی خوب هستید اما نیاز به بهبود در برخی زمینه‌ها دارید. با تمرین و یادگیری می‌توانید بهتر شوید.",
        strengths: [
          "برخی مهارت‌های تیمی",
          "مشارکت نسبی",
          "آمادگی برای بهبود"
        ],
        recommendations: [
          "**توسعه مهارت‌ها**: تقویت مهارت‌های ضعیف‌تر",
          "**مشارکت بیشتر**: افزایش مشارکت در تصمیم‌گیری‌ها",
          "**رهبری**: تمرین رهبری در موقعیت‌های کوچک",
          "**همکاری**: بهبود همکاری با اعضای تیم",
          "**مسئولیت‌پذیری**: پذیرش مسئولیت‌های بیشتر"
        ]
      };
    } else {
      return {
        level: "نقش تیمی عالی",
        color: "#22c55e",
        desc: "شما یک عضو مؤثر تیم هستید! مهارت‌های تیمی قوی دارید.",
        details: "تبریک! شما مهارت‌های تیمی عالی دارید. شما می‌توانید به طور مؤثر در تیم کار کنید، رهبری کنید و به موفقیت تیم کمک کنید.",
        strengths: [
          "رهبری مؤثر",
          "همکاری عالی",
          "حل مسئله",
          "ارتباط مؤثر",
          "انگیزه بخشی",
          "مدیریت تیم"
        ],
        recommendations: [
          "**حفظ عملکرد**: ادامه حفظ این سطح عالی",
          "**منتور**: کمک به دیگران در بهبود مهارت‌های تیمی",
          "**چالش‌های جدید**: پذیرش چالش‌های تیمی جدید",
          "**رشد مداوم**: ادامه یادگیری و رشد"
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
        return (
            <div className="w-full flex flex-col items-center">
                <Header />
                <MobileHeader />

                <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
                    <Sidebar />

                    <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                                <FaUsers className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست نقش تیمی</h1>
                                <p className="text-secondaryTextColor">ارزیابی نقش و عملکرد شما در تیم</p>
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
                            <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
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
                                        <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
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
                                        title: { display: true, text: 'تحلیل نمره نقش تیمی', color: '#e5e7eb', font: { size: 16 } }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                                        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                                    }
                                }} />
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
                            <FaUsers className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست نقش تیمی</h1>
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