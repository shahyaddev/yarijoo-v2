"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaFire } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("resilience");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "می‌توانم با هر چیزی که پیش بیاید کنار بیایم",
    "روابط نزدیک و امن دارم",
    "گاهی سرنوشت یا خدا می‌تواند کمک کند",
    "با هر اتفاقی کنار می‌آیم",
    "دستاوردهای گذشته به من اعتماد می‌دهد",
    "وقتی همه چیز نامشخص است، بهترین کار را می‌دانم",
    "مشکلات را از زوایای مختلف می‌بینم",
    "گاهی خودم را مجبور می‌کنم کارها را انجام دهم",
    "چه اتفاقی بیفتد، به آن رسیدگی می‌کنم",
    "از موفقیت‌های گذشته انگیزه می‌گیرم",
    "معمولاً چندین راه برای مشکل پیدا می‌کنم",
    "می‌توانم حتی وقتی دیگران مخالفند، کاری را انجام دهم",
    "حتی در سختی‌ها قوی می‌مانم",
    "تحت فشار تمرکز می‌کنم و واضح فکر می‌کنم",
    "ترجیح می‌دهم رهبری کنم تا دنبال‌رو باشم",
    "شکست مرا دلسرد نمی‌کند",
    "فردی قوی هستم",
    "می‌توانم تصمیمات سخت بگیرم",
    "می‌توانم احساسات ناخوشایند را کنترل کنم",
    "باید برای انجام کارها عمل کنم",
    "احساس کنترل بر زندگی‌ام دارم",
    "چالش‌ها را دوست دارم",
    "برای رسیدن به اهدافم سخت کار می‌کنم",
    "غرور و افتخار به دستاوردهایم دارم",
    "می‌دانم کجا کمک بخواهم"
  ];

  const options = [
    { value: 0, label: "اصلاً درست نیست" },
    { value: 1, label: "به ندرت درست است" },
    { value: 2, label: "گاهی درست است" },
    { value: 3, label: "اغلب درست است" },
    { value: 4, label: "تقریباً همیشه درست است" }
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
    return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
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
    
    if (score <= 40) {
      return {
        level: "تاب‌آوری پایین",
        color: "#ef4444",
        desc: "تاب‌آوری پایین - آسیب‌پذیری در مواجهه با چالش‌ها",
        details: "تاب‌آوری شما در سطح پایین است. در مواجهه با چالش‌ها و استرس، دشواری بیشتری تجربه می‌کنید. مهارت‌های مقابله محدود، احساس ناامیدی سریع، بازیابی کند از استرس و تمرکز بر جنبه‌های منفی از ویژگی‌های این سطح است. این وضعیت می‌تواند منجر به مشکلات روانی و کاهش کیفیت زندگی شود.",
        strengths: [],
        recommendations: [
          "**CBT**: یادگیری مهارت‌های مقابله از طریق درمان شناختی-رفتاری",
          "**حل مسئله**: آموزش مهارت‌های حل مسئله و تصمیم‌گیری",
          "**بازسازی شناختی**: یادگیری تفکر مثبت و تغییر الگوهای منفی",
          "**شبکه حمایتی**: ایجاد و تقویت شبکه حمایتی اجتماعی",
          "**خودمراقبتی**: توجه به سلامت جسمی و روانی",
          "**اهداف کوچک**: تعیین و دستیابی به موفقیت‌های کوچک برای ایجاد اعتماد",
          "**مشاوره**: دریافت کمک حرفه‌ای برای بهبود تاب‌آوری"
        ]
      };
    } else if (score <= 70) {
      return {
        level: "تاب‌آوری متوسط",
        color: "#eab308",
        desc: "تاب‌آوری متوسط - قابلیت بهبود",
        details: "تاب‌آوری شما در حد متوسط است. می‌توانید با چالش‌ها کنار بیایید اما فضای بهبود وجود دارد. شما توانایی نسبی در مواجهه با چالش‌ها دارید اما نیاز به تقویت مهارت‌های مقابله و بهبود سرعت بازیابی از استرس دارید.",
        strengths: [
          "برخی مهارت‌های مقابله موجود",
          "درک نیاز به بهبود و رشد",
          "انگیزه برای پیشرفت"
        ],
        recommendations: [
          "**تقویت نقاط قوت**: شناسایی و تقویت مهارت‌های مقابله موجود",
          "**بهبود نقاط ضعف**: کار بر روی مهارت‌های ضعیف‌تر",
          "**یادگیری تکنیک‌های جدید**: آموزش تکنیک‌های جدید مدیریت استرس",
          "**تجربه چالش‌های جدید**: مواجهه تدریجی با چالش‌های کوچک برای رشد",
          "**تمرین منظم**: تمرین روزانه مهارت‌های تاب‌آوری"
        ]
      };
    } else {
      return {
        level: "تاب‌آوری بالا",
        color: "#22c55e",
        desc: "تاب‌آوری بالا - مقاومت عالی",
        details: "شما تاب‌آوری بالایی دارید. به خوبی با چالش‌ها مقابله می‌کنید و سریع بهبود می‌یابید. مهارت‌های مقابله قوی، بازیابی سریع از استرس، نگرش مثبت به چالش‌ها، انعطاف‌پذیری در سازگاری با تغییرات و شبکه حمایتی مناسب از ویژگی‌های شماست.",
        strengths: [
          "مقابله مؤثر با چالش‌ها",
          "بازیابی سریع از استرس",
          "تفکر مثبت و سازنده",
          "انعطاف‌پذیری و سازگاری",
          "شبکه حمایتی اجتماعی قوی",
          "خودکنترلی و مدیریت احساسات"
        ],
        recommendations: [
          "**حفظ و تقویت**: ادامه تقویت مهارت‌های تاب‌آوری",
          "**کمک به دیگران**: به اشتراک گذاشتن تجربیات و کمک به دیگران",
          "**الگو بودن**: الهام بخشیدن به دیگران برای رشد تاب‌آوری",
          "**چالش‌های جدید**: پذیرش چالش‌های جدید برای رشد مداوم"
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

    const chartData = {
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'نمره تاب‌آوری',
        data: [score, 40, 70, 100],
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
                <FaFire className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست تاب‌آوری (Resilience)</h1>
                <p className="text-secondaryTextColor">ارزیابی تاب‌آوری شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 100</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره تاب‌آوری و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح تاب‌آوری</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">مؤلفه‌های تاب‌آوری</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "**خوش‌بینی**: نگرش مثبت به آینده",
                  "**کنترل**: احساس کنترل بر زندگی",
                  "**معنا**: داشتن هدف و معنا",
                  "**انعطاف**: سازگاری با تغییرات",
                  "**حل مسئله**: مهارت حل مشکلات",
                  "**حمایت**: شبکه حمایتی قوی",
                  "**خودکارآمدی**: اعتماد به توانایی‌ها"
                ].map((component, index) => (
                  <div key={index} className="bg-secondaryThemeColor rounded-xl p-3">
                    <p className="text-sm text-secondaryTextColor" dangerouslySetInnerHTML={{ __html: component.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primaryThemeColor">$1</strong>') }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 راه‌های تقویت تاب‌آوری</h4>
              <ul className="space-y-2 text-sm text-blue-300">
                {[
                  "تجربه چالش‌ها و غلبه بر آنها",
                  "یادگیری از شکست‌ها",
                  "تقویت روابط",
                  "یافتن معنا",
                  "مراقبت از سلامت",
                  "تمرین ذهن‌آگاهی",
                  "کمک به دیگران"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{item}</span>
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
              <FaFire className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست تاب‌آوری (Resilience)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion]}</h3>
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
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
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