"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeart } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { useTestResult } from "@/hooks/useTestResult";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("scs_lf");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    // Self-Kindness (4 questions)
    { text: "نسبت به نقص‌هایم مهربان هستم", reverse: false, subscale: "self_kindness" },
    { text: "با خودم صبور هستم", reverse: false, subscale: "self_kindness" },
    { text: "وقتی رنج می‌برم، با خودم با نرمی رفتار می‌کنم", reverse: false, subscale: "self_kindness" },
    { text: "با خودم با درک و صبوری برخورد می‌کنم", reverse: false, subscale: "self_kindness" },
    
    // Self-Judgment (4 questions - reverse)
    { text: "با خودم انتقادی رفتار می‌کنم", reverse: true, subscale: "self_judgment" },
    { text: "خودم را سرزنش می‌کنم", reverse: true, subscale: "self_judgment" },
    { text: "وقتی مشکلی پیش می‌آید، خودم را به شدت قضاوت می‌کنم", reverse: true, subscale: "self_judgment" },
    { text: "به خودم سخت می‌گیرم وقتی کارها درست پیش نمی‌رود", reverse: true, subscale: "self_judgment" },
    
    // Common Humanity (4 questions)
    { text: "می‌دانم دیگران هم مشکلات مشابه دارند", reverse: false, subscale: "common_humanity" },
    { text: "شکست‌ها را طبیعی می‌دانم", reverse: false, subscale: "common_humanity" },
    { text: "وقتی اشتباه می‌کنم، یادم می‌افتد که همه اشتباه می‌کنند", reverse: false, subscale: "common_humanity" },
    { text: "درک می‌کنم که همه انسان‌ها در زندگی با چالش‌هایی روبرو می‌شوند", reverse: false, subscale: "common_humanity" },
    
    // Isolation (4 questions - reverse)
    { text: "احساس انزوا می‌کنم وقتی مشکل دارم", reverse: true, subscale: "isolation" },
    { text: "احساس می‌کنم تنها هستم", reverse: true, subscale: "isolation" },
    { text: "وقتی رنج می‌برم، احساس می‌کنم دیگران شادتر از من هستند", reverse: true, subscale: "isolation" },
    { text: "احساس می‌کنم مشکلاتم منحصر به فرد است و دیگران نمی‌فهمند", reverse: true, subscale: "isolation" },
    
    // Mindfulness (4 questions)
    { text: "متعادل نگاه می‌کنم", reverse: false, subscale: "mindfulness" },
    { text: "دیدگاه متعادل دارم", reverse: false, subscale: "mindfulness" },
    { text: "وقتی چیز ناراحت‌کننده‌ای رخ می‌دهد، سعی می‌کنم آن را متعادل ببینم", reverse: false, subscale: "mindfulness" },
    { text: "در زمان‌های سختی، احساساتم را بدون غرق شدن در آن‌ها مشاهده می‌کنم", reverse: false, subscale: "mindfulness" },
    
    // Over-identification (4 questions - reverse)
    { text: "در احساسات منفی غرق می‌شوم", reverse: true, subscale: "over_identification" },
    { text: "بیش از حد بر مشکلات تمرکز می‌کنم", reverse: true, subscale: "over_identification" },
    { text: "وقتی چیز ناراحت‌کننده‌ای رخ می‌دهد، در آن غرق می‌شوم و گرفتار می‌شوم", reverse: true, subscale: "over_identification" },
    { text: "به سختی می‌توانم از افکار منفی درباره مشکلاتم فاصله بگیرم", reverse: true, subscale: "over_identification" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "تقریباً هرگز" },
    { value: 2, label: "به ندرت" },
    { value: 3, label: "گاهی" },
    { value: 4, label: "اغلب" },
    { value: 5, label: "تقریباً همیشه" }
  ], []);

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const subscales = {
      self_kindness: [],
      self_judgment: [],
      common_humanity: [],
      isolation: [],
      mindfulness: [],
      over_identification: []
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      let score = answer;
      if (q.reverse) {
        score = 6 - answer;
      }
      subscales[q.subscale].push(score);
    });

    const subscaleMeans = {};
    Object.keys(subscales).forEach(key => {
      const scores = subscales[key];
      subscaleMeans[key] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });

    // Self-compassion score = mean of (self_kindness + common_humanity + mindfulness) - mean of (self_judgment + isolation + over_identification)
    const positiveSubscales = (subscaleMeans.self_kindness + subscaleMeans.common_humanity + subscaleMeans.mindfulness) / 3;
    const negativeSubscales = (subscaleMeans.self_judgment + subscaleMeans.isolation + subscaleMeans.over_identification) / 3;
    const totalScore = (positiveSubscales - negativeSubscales + 6) / 2; // Normalize to 1-5 scale

    return {
      total: totalScore,
      self_kindness: subscaleMeans.self_kindness,
      self_judgment: subscaleMeans.self_judgment,
      common_humanity: subscaleMeans.common_humanity,
      isolation: subscaleMeans.isolation,
      mindfulness: subscaleMeans.mindfulness,
      over_identification: subscaleMeans.over_identification
    };
  };

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        const scores = calculateScores();
        const score = scores.totalScore || scores.total_score || Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
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
            scores: scores
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


  const getInterpretation = (scores) => {
    const mean = scores.total;
    
    if (mean <= 2.5) {
      return {
        level: "خودشفقتی پایین",
        color: "#ef4444",
        desc: "سخت‌گیری با خود، خودانتقادی شدید، احساس انزوا در رنج.",
        details: "خودشفقتی شما پایین است. شما تمایل دارید با خود سخت باشید، خود را به شدت انتقاد کنید و در زمان رنج احساس تنهایی کنید. این الگو می‌تواند منجر به افسردگی، اضطراب، استرس مزمن و کاهش کیفیت زندگی شود. بهبود خودشفقتی می‌تواند تأثیر قابل توجهی بر سلامت روانی شما داشته باشد.",
        strengths: [
          "آگاهی از نیاز به تغییر",
          "تمایل به بهبود وضعیت"
        ],
        recommendations: [
          "**برنامه MSC**: شرکت در دوره Mindful Self-Compassion برای یادگیری خودشفقتی",
          "**خودگفتاری مهربان**: صحبت با خود مانند یک دوست صمیمی و حمایت‌کننده",
          "**درک انسانیت مشترک**: یادآوری اینکه همه انسان‌ها اشتباه می‌کنند و رنج می‌برند",
          "**تمرین ذهن‌آگاهی**: پذیرش احساسات بدون قضاوت و غرق شدن",
          "**نوشتن نامه**: نوشتن نامه مهربانانه به خود در زمان سختی و رنج",
          "**درمان CFT**: درمان متمرکز بر شفقت (Compassion-Focused Therapy) با روان‌شناس",
          "**کاهش خودانتقادی**: شناسایی و به چالش کشیدن افکار خودانتقادی شدید",
          "**مراقبت از خود**: انجام رفتارهای مهربانانه با خود مانند استراحت و فعالیت‌های لذت‌بخش"
        ]
      };
    } else if (mean <= 3.5) {
      return {
        level: "خودشفقتی متوسط",
        color: "#eab308",
        desc: "خودشفقتی در حد متوسط - نیاز به تقویت دارد.",
        details: "خودشفقتی شما در حد متوسط است. شما گاهی اوقات می‌توانید با خود مهربان باشید اما هنوز در زمان‌های سختی تمایل به خودانتقادی دارید. با تمرین بیشتر می‌توانید خودشفقتی خود را تقویت کنید و بهره‌مندی بیشتری از مزایای آن ببرید.",
        strengths: [
          "برخی مهارت‌های خودشفقتی پایه",
          "آگاهی از اهمیت خودشفقتی",
          "توانایی گاهی مهربان بودن با خود"
        ],
        recommendations: [
          "**تمرین منظم**: اختصاص زمان روزانه برای تمرین خودشفقتی",
          "**برنامه MSC**: شرکت در دوره‌های آموزشی خودشفقتی",
          "**خودگفتاری مهربان**: تمرین صحبت مثبت و حمایت‌کننده با خود",
          "**تمرینات ذهن‌آگاهی**: افزایش آگاهی از لحظه حال بدون قضاوت",
          "**یادگیری پذیرش**: پذیرش اشتباهات و ناقص بودن به عنوان بخشی از انسانیت",
          "**نوشتن روزانه**: ثبت افکار و احساسات با نگاه مهربانانه",
          "**کاهش انتقاد از خود**: جایگزینی خودانتقادی با گفتار مهربانانه"
        ]
      };
    } else {
      return {
        level: "خودشفقتی بالا",
        color: "#22c55e",
        desc: "مهربانی با خود، پذیرش اشتباهات، درک انسانیت مشترک.",
        details: "خودشفقتی شما در سطح بالایی است. شما می‌توانید با خود مهربان باشید، اشتباهات را بپذیرید و درک می‌کنید که همه انسان‌ها ناقص هستند. این سطح از خودشفقتی با سلامت روان بهتر، مقاومت بیشتر در برابر استرس، رضایت بیشتر از زندگی و روابط بهتر همراه است. این یک مهارت ارزشمند است که باید حفظ شود.",
        strengths: [
          "مهربانی با خود در زمان سختی",
          "پذیرش اشتباهات و ناقص بودن",
          "درک انسانیت مشترک",
          "تعادل بین خودانتقادی و خوددوستی",
          "مقاومت بیشتر در برابر استرس",
          "سلامت روانی بهتر",
          "ذهن‌آگاهی و تعادل",
          "روابط بهتر با دیگران"
        ],
        recommendations: [
          "**حفظ سطح فعلی**: ادامه تمرینات منظم خودشفقتی",
          "**به اشتراک‌گذاری**: به اشتراک‌گذاری تجربیات و دانش با دیگران",
          "**کمک به دیگران**: کمک به دیگران در یادگیری خودشفقتی",
          "**ادامه رشد**: ادامه یادگیری و رشد در مسیر خودشفقتی",
          "**الگو بودن**: الگو بودن برای دیگران در زمینه خودشفقتی",
          "**مراقبت مداوم**: ادامه مراقبت از خود و حفظ تعادل"
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
    const scores = calculateScores();
    const interpretation = getInterpretation(scores);

    const chartData = {
      labels: ["مهربانی با خود", "خودانتقادی", "انسانیت مشترک", "انزوا", "ذهن‌آگاهی", "بیش‌تطبیقی"],
      datasets: [
        {
          label: "نمره زیرمقیاس‌ها",
          data: [
            scores.self_kindness.toFixed(2),
            scores.self_judgment.toFixed(2),
            scores.common_humanity.toFixed(2),
            scores.isolation.toFixed(2),
            scores.mindfulness.toFixed(2),
            scores.over_identification.toFixed(2)
          ],
          backgroundColor: [
            "#22c55e",
            "#ef4444",
            "#22c55e",
            "#ef4444",
            "#22c55e",
            "#ef4444"
          ],
          borderColor: [
            "#16a34a",
            "#dc2626",
            "#16a34a",
            "#dc2626",
            "#16a34a",
            "#dc2626"
          ],
          borderWidth: 2
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "مقیاس خودشفقتی - فرم بلند (SCS-LF)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 10 } },
          grid: { color: "#334155" }
        }
      }
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
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس خودشفقتی (فرم بلند)</h1>
                <p className="text-secondaryTextColor">Self-Compassion Scale - Long Form (SCS-LF)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح خودشفقتی</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
              <div className="text-lg font-semibold mb-4" style={{ color: interpretation.color }}>
                {scores.total.toFixed(2)} از 5.0
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار زیرمقیاس‌ها</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
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
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس خودشفقتی (فرم بلند)</h1>
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
            >
              {questions[currentQuestion]}
            </h3>
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
              <div
                className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;