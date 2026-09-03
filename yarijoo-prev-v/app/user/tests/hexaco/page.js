"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hexaco");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "در مسائل مالی/امانی، حتی در نبود نظارت، کاملاً صادق می‌مانم.",
  "معمولاً در جمع‌ها پیش‌قدم و پرانرژی هستم.",
  "به تجربه‌های تازه و ایده‌های متفاوت علاقه‌مندم.",
  "برای دیگران وقت و احترام قائل می‌شوم، حتی در اختلاف نظر.",
  "وظایفم را با دقت و پیگیری کامل انجام می‌دهم.",
  "به آسانی دچار نگرانی یا تنش می‌شوم.",
  "برای رسیدن به منافع شخصی، واقعیت را وارونه جلوه می‌دهم.",
  "در تعاملات اجتماعی غالباً کم‌حرف و کناره‌گیرم.",
  "ترجیح می‌دهم از چارچوب‌های آشنا خارج نشوم.",
  "برای رسیدن به خواسته‌هایم، سختگیر و ناسازگار می‌شوم.",
  "اغلب کارها را به تعویق می‌اندازم و نیمه‌کاره می‌گذارم.",
  "در شرایط فشار نیز آرامش خود را نگه می‌دارم.",
  "از منافع و امتیازات ناعادلانه پرهیز می‌کنم.",
  "در جمع به‌راحتی با افراد جدید گفت‌وگو را آغاز می‌کنم.",
  "به هنر، زیبایی و ظرافت‌های محیط توجه دارم.",
  "در تعارض‌ها تلاش می‌کنم نظر طرف مقابل را بفهمم.",
  "برای رسیدن به هدف، برنامه‌ریزی و پیگیری منظم دارم.",
  "گاهی موجی از اضطراب یا دلشوره را تجربه می‌کنم.",
  "برای سود شخصی از اعتماد دیگران سوءاستفاده می‌کنم.",
  "ترجیح می‌دهم در مراسم اجتماعی کمتر در مرکز توجه باشم.",
  "به ندرت کنجکاوی فکری برای آموختن چیزهای نو دارم.",
  "در مذاکره‌ها انعطاف و همکاری نشان می‌دهم.",
  "در برآورد زمان/منابع واقع‌بین و دقیق هستم.",
  "در مواجهه با ناکامی، زود دلسرد می‌شوم.",
  "برای کسب جایگاه، خود را بهتر از واقع نشان می‌دهم.",
  "از تعاملات گروهی انرژی مثبت می‌گیرم.",
  "از دیدگاه‌های متفاوت استقبال می‌کنم و در آن‌ها تامل می‌کنم.",
  "با ملاحظه و ادب با دیگران برخورد می‌کنم.",
  "گاهی بی‌نظم و شتاب‌زده عمل می‌کنم.",
  "در موقعیت‌های پراسترس به‌خوبی خود را بازیابی می‌کنم.",
  "اگر اشتباهی کنم، مسئولیت آن را می‌پذیرم.",
  "در موقعیت‌های اجتماعی با شور و اشتیاق مشارکت می‌کنم.",
  "از یادگیری موضوعات ناشناخته لذت می‌برم.",
  "در بحث‌ها با احترام اختلاف‌نظر را مدیریت می‌کنم.",
  "برای تحویل به‌موقع خروجی‌ها برنامه دارم.",
  "گاه هیجانات من شدیدتر از حد مطلوب می‌شود.",
  "برای پنهان کردن خطاها آماده‌ام واقعیت را مخدوش کنم.",
  "در جمع‌های بزرگ ترجیح می‌دهم ساکت بمانم.",
  "نسبت به هنر و زیبایی بی‌تفاوت هستم.",
  "در تعاملات به‌سختی کوتاه می‌آیم.",
  "گاهی از استانداردهای کاری‌ام کوتاه می‌آیم.",
  "در مواجهه با استرس‌های ناگهانی آرام می‌مانم.",
  "وقتی کسی به من اعتماد می‌کند، آن را کاملاً رعایت می‌کنم.",
  "در رویدادهای اجتماعی، شروع‌کننده ارتباط هستم.",
  "به کشف ایده‌های نو در کار و زندگی علاقه‌مندم.",
  "در تعارض‌ها، راه‌حل برد-برد پیشنهاد می‌دهم.",
  "در مدیریت زمان و منابع، انضباط بالایی دارم.",
  "نگرانی‌های مداوم عملکردم را تحت تاثیر قرار می‌دهد.",
  "برای رسیدن به سود شخصی، وعده‌های غیرواقعی می‌دهم.",
  "معمولاً از مرکز توجه دوری می‌کنم.",
  "کمتر پیگیر یادگیری مهارت‌های تازه هستم.",
  "در همکاری‌ها اهل گذشت و مصالحه‌ام.",
  "برای کیفیت خروجی‌ها چک‌لیست ثابت دارم.",
  "در فشار کاری زود از کوره در می‌روم.",
  "برای جلو رفتن، از نام دیگران سوءاستفاده می‌کنم.",
  "تعامل اجتماعی برایم انرژی‌بخش است.",
  "با نظرهای غیرمتعارف با ذهن باز مواجه می‌شوم.",
  "در اختلاف‌ها با آرامش و احترام رفتار می‌کنم.",
  "گاهی کارها را بدون برنامه قبلی شروع می‌کنم.",
  "پس از تجربه‌های استرس‌زا، سریع بازمی‌گردم.",
  "برای منافع بیشتر، حاضر به پذیرش ریسک اخلاقی نیستم.",
  "در گفت‌وگوهای گروهی نقش فعالی دارم.",
  "کنجکاوی من باعث می‌شود موضوعات جدید را دنبال کنم.",
  "در تعارض‌ها به آرامی مذاکره می‌کنم.",
  "برای اطمینان از تحویل به‌موقع، از ابزارهای مدیریت زمان استفاده می‌کنم.",
  "هیجانات من زود از کنترل خارج می‌شود.",
  "اگر بتوانم، سهم خود را بیش از واقع نشان می‌دهم.",
  "در جمع‌ها معمولاً عقب می‌نشینم و کمتر صحبت می‌کنم.",
  "کمتر پذیرای ایده‌های غیرمعمول هستم.",
  "در بحث‌ها سختگیر و انعطاف‌ناپذیر می‌شوم.",
  "استانداردهای کاری‌ام را گاه نادیده می‌گیرم.",
  "در بحران‌ها معمولاً آرام می‌مانم.",
  "در مواجهه با سود غیرمنصفانه، آن را رد می‌کنم.",
  "حضور در جمع‌ها مرا سرحال می‌کند.",
  "به تجربه‌های فرهنگی/هنری جدید علاقه دارم.",
  "در اختلاف‌ها به احساسات طرف مقابل توجه می‌کنم.",
  "برنامه‌ریزی دقیق، کیفیت کارم را بالا می‌برد.",
  "نگرانی‌های مداوم تمرکزم را کاهش می‌دهد.",
  "برای بالا بردن جایگاه، اطلاعات را گزینشی منتقل می‌کنم.",
  "در محیط‌های اجتماعی، کمتر نقش رهبری می‌گیرم.",
  "کمتر به دنبال کشف راه‌های نو می‌روم.",
  "در تعارض‌ها توجهی به سازش نشان نمی‌دهم.",
  "گاهی کارها را نیمه‌تمام رها می‌کنم.",
  "در شرایط دشوار، به‌سختی آرام می‌مانم.",
  "در قبال امتیازات ویژه، احساس ناراحتی می‌کنم و نمی‌پذیرم.",
  "با افراد جدید به‌سرعت ارتباط برقرار می‌کنم.",
  "دیدگاه‌های نو را با علاقه بررسی می‌کنم.",
  "در روابط، مهربانی و احترام را حفظ می‌کنم.",
  "برای بهبود بهره‌وری، روال‌های ثابتی ایجاد می‌کنم.",
  "پس از فشارهای روانی، توان بازیابی بالایی دارم.",
  "حتی فرصت‌های سودآور ناسالم را رد می‌کنم.",
  "در رویدادها به‌راحتی با دیگران وارد گفت‌وگو می‌شوم.",
  "از یادگیری مهارت‌های تازه هیجان‌زده می‌شوم.",
  "در همکاری‌ها، منافع مشترک را بر منافع شخصی مقدم می‌دانم.",
  "اهداف را به وظایف کوچک قابل اجرا می‌شکنم.",
  "در شرایط پرتنش، تکنیک‌های آرام‌سازی را به‌کار می‌گیرم.",
  "برای جلب توجه، واقعیت را بزک می‌کنم.",
  "در جمع‌های بزرگ معمولاً کم‌حرف هستم.",
  "کمتر به دنبال تجربه‌های نو و متفاوت می‌روم.",
  "هنگام اختلاف، کمتر به سازش فکر می‌کنم."
        ]

  const options = [
  {
    "value": 1,
    "label": "کاملاً مخالفم"
  },
  {
    "value": 2,
    "label": "مخالفم"
  },
  {
    "value": 3,
    "label": "نه موافق نه مخالف"
  },
  {
    "value": 4,
    "label": "موافقم"
  },
  {
    "value": 5,
    "label": "کاملاً موافقم"
  }
        ]

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
    const maxScore = 500;
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
    const maxScore = questions.length * Math.max(...options.map(o => o.value));

    const chartData = {
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'نمره تست',
        data: [score, maxScore * 0.33, maxScore * 0.66, maxScore],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }]
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست HEXACO</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">
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
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست HEXACO</h1>
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
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;