"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHandshake } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("trust");
  const [savedScore, setSavedScore] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        "معمولاً به مردم اعتماد می‌کنم",
        "بیشتر مردم صادق هستند",
        "بیشتر مردم قابل اعتماد هستند",
        "بیشتر مردم مهربان و دلسوز هستند",
        "بیشتر مردم منصف هستند",
        "بیشتر مردم به قول خود عمل می‌کنند",
        "بیشتر مردم در زمان نیاز کمک می‌کنند",
        "بیشتر مردم رازدار هستند",
        "بیشتر مردم به حقوق دیگران احترام می‌گذارند",
        "بیشتر مردم در کارهایشان صداقت دارند",
        "بیشتر مردم در روابطشان وفادار هستند",
        "بیشتر مردم در تصمیم‌گیری‌هایشان عادلانه عمل می‌کنند",
        "بیشتر مردم در مشکلاتشان صادقانه رفتار می‌کنند",
        "بیشتر مردم در روابطشان شفاف هستند",
        "بیشتر مردم در کارهایشان مسئولیت‌پذیر هستند",
        "بیشتر مردم در روابطشان صمیمی هستند",
        "بیشتر مردم در مشکلاتشان حمایت‌کننده هستند",
        "بیشتر مردم در روابطشان متعهد هستند",
        "بیشتر مردم در کارهایشان قابل پیش‌بینی هستند",
        "بیشتر مردم در روابطشان ثابت‌قدم هستند",
        "بیشتر مردم در مشکلاتشان همدل هستند",
        "بیشتر مردم در روابطشان صبور هستند",
        "بیشتر مردم در کارهایشان دقیق هستند",
        "بیشتر مردم در روابطشان قابل اعتماد هستند",
        "بیشتر مردم در مشکلاتشان راه‌حل‌گرا هستند"
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
        level: "اعتماد پایین",
        color: "#ef4444",
        desc: "اعتماد شما به دیگران پایین است. این می‌تواند روابط را دشوار کند.",
        details: "نمره پایین شما نشان می‌دهد که به دیگران اعتماد کمی دارید. این می‌تواند ناشی از تجربیات منفی گذشته یا دیدگاه محتاطانه باشد.",
        strengths: ["محتاط", "آگاه از خطرات"],
        recommendations: [
          "**درک دلایل**: چه چیز باعث بی‌اعتمادی شده؟",
          "**شروع کوچک**: اعتماد تدریجی به افراد قابل اعتماد",
          "**شفافیت**: درخواست شفافیت از دیگران",
          "**مشاوره**: کمک برای حل مشکلات اعتماد",
          "**تعادل**: بین احتیاط و اعتماد"
        ]
      };
    } else if (score <= 75) {
      return {
        level: "اعتماد متوسط",
        color: "#eab308",
        desc: "اعتماد شما به دیگران متوسط است. در برخی موقعیت‌ها احتیاط می‌کنید.",
        details: "شما اعتماد نسبی به دیگران دارید اما گاهی محتاط هستید. این تعادل سالمی است.",
        strengths: ["تعادل", "احتیاط منطقی"],
        recommendations: [
          "**شناسایی افراد قابل اعتماد**: تشخیص کسانی که قابل اعتماد هستند",
          "**شفافیت در ارتباط**: بیان انتظارات و مرزها",
          "**ساخت اعتماد تدریجی**: اعتماد به مرور زمان"
        ]
      };
    } else {
      return {
        level: "اعتماد بالا",
        color: "#22c55e",
        desc: "اعتماد شما به دیگران بالا است. این می‌تواند روابط را تقویت کند.",
        details: "شما به دیگران اعتماد دارید و این می‌تواند روابط مثبت ایجاد کند. فقط مراقب باشید که اعتماد کورکورانه نباشد.",
        strengths: ["روابط مثبت", "خوش‌بینی", "ارتباطات باز"],
        recommendations: [
          "**حفظ تعادل**: بین اعتماد و احتیاط",
          "**هوشیاری**: توجه به نشانه‌های قابلیت اعتماد",
          "**کمک به دیگران**: الهام بخشیدن اعتماد متقابل"
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
                                <FaHandshake className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست اعتماد</h1>
                                <p className="text-secondaryTextColor">ارزیابی سطح اعتماد به دیگران شما</p>
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
                                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">سطح اعتماد</h3>
                                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                                <div className="text-sm text-secondaryTextColor mb-2">{interpretation.desc}</div>
                                <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
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
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار سطح اعتماد</h3>
                            <div className="h-80">
                                <Bar
                                    data={{
                                        labels: ['نمره شما', 'پایین (25-50)', 'متوسط (51-75)', 'بالا (76-125)'],
                                        datasets: [{
                                            label: 'تحلیل نمره',
                                            data: [score, 50, 75, 125],
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
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            title: { display: true, text: 'تحلیل اعتماد', color: '#e5e7eb', font: { size: 16 } }
                                        },
                                        scales: {
                                            y: { beginAtZero: true, max: 125, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                                            x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-darkThemeColor rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primaryTextColor mb-4">راهنمایی‌های اضافی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">ساخت اعتماد</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• صداقت در ارتباطات</li>
                                        <li>• قابلیت اطمینان در عمل</li>
                                        <li>• مهربانی و دلسوزی</li>
                                        <li>• انصاف در تصمیم‌گیری</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-primaryTextColor mb-2">حفظ اعتماد</h4>
                                    <ul className="text-sm text-secondaryTextColor space-y-1">
                                        <li>• حفظ قول‌ها</li>
                                        <li>• شفافیت در ارتباطات</li>
                                        <li>• احترام به حقوق دیگران</li>
                                        <li>• مسئولیت‌پذیری</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
                            <h4 className="font-medium text-blue-400 mb-2">💡 نکته مهم</h4>
                            <p className="text-sm text-blue-300">
                                اعتماد به دیگران یکی از مهم‌ترین عوامل در روابط اجتماعی و موفقیت در زندگی است.
                                حفظ تعادل بین اعتماد و احتیاط ضروری است.
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
                            <FaHandshake className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primaryTextColor">تست اعتماد</h1>
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








