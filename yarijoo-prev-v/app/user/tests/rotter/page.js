"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBalanceScale } from "react-icons/fa";
import { useTestResult } from "@/hooks/useTestResult";


const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("rotter");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text_a: "موفقیت من به تلاشم بستگی دارد", text_b: "موفقیت من به شانس بستگی دارد", internal: "a" },
    { text_a: "من سرنوشت خودم را می‌سازم", text_b: "زندگی توسط نیروهای خارجی کنترل می‌شود", internal: "a" },
    { text_a: "تلاش من نتیجه می‌دهد", text_b: "تلاش معمولاً بی‌فایده است", internal: "a" },
    { text_a: "می‌توانم زندگی‌ام را تغییر دهم", text_b: "زندگی‌ام از پیش تعیین شده", internal: "a" },
    { text_a: "من کنترل دارم", text_b: "دیگران کنترل دارند", internal: "a" },
    { text_a: "برنامه‌ریزی کار می‌کند", text_b: "برنامه‌ریزی معمولاً شکست می‌خورد", internal: "a" },
    { text_a: "توانایی‌هایم مهم است", text_b: "شانس مهم‌تر از توانایی است", internal: "a" },
    { text_a: "انتخاب‌هایم مهم هستند", text_b: "انتخاب‌ها تفاوتی نمی‌کنند", internal: "a" },
    { text_a: "من مسئول زندگی‌ام هستم", text_b: "محیط من را شکل می‌دهد", internal: "a" },
    { text_a: "می‌توانم تغییر ایجاد کنم", text_b: "تغییر خارج از کنترلم است", internal: "a" }
  ], []);

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (choice) => {
    const question = questionsData[currentQuestion];
    const isInternal = choice === question.internal;
    setAnswers({ ...answers, [currentQuestion]: isInternal ? "internal" : "external" });
    
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let internalCount = 0;
    Object.values(answers).forEach(answer => {
      if (answer === "internal") internalCount++;
    });
    return internalCount;
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
    const totalQuestions = questionsData.length;
    const internalCount = score;
    const externalCount = totalQuestions - score;
    
    if (internalCount >= 7) {
      return {
        type: "internal",
        level: "مرکز کنترل درونی",
        color: "#22c55e",
        percentage: Math.round((internalCount / totalQuestions) * 100),
        desc: "اعتقاد به کنترل بر زندگی خود - نتایج حاصل اعمال خود.",
        benefits: [
          "موفقیت بیشتر در زندگی",
          "تلاش بیشتر برای رسیدن به اهداف",
          "مسئولیت‌پذیری بالاتر",
          "سلامت روانی و جسمانی بهتر",
          "مقابله فعال با مشکلات"
        ],
        caution: "افراطی می‌تواند منجر به خودسرزنشی برای چیزهای خارج از کنترل شود.",
        guidance: [
          "حفظ این نگرش مثبت",
          "تعادل با پذیرش محدودیت‌های خارج از کنترل",
          "استفاده از این نگرش در راه موفقیت",
          "توجه به عوامل خارجی که خارج از کنترل شماست"
        ]
      };
    } else if (internalCount >= 4) {
      return {
        type: "moderate",
        level: "متعادل",
        color: "#eab308",
        percentage: Math.round((internalCount / totalQuestions) * 100),
        desc: "تعادل بین مسئولیت شخصی و پذیرش عوامل خارجی.",
        guidance: [
          "تعادل خوب بین کنترل درونی و بیرونی",
          "حفظ این تعادل در موقعیت‌های مختلف",
          "انعطاف در نگرش بسته به موقعیت",
          "شناسایی موقعیت‌هایی که کنترل بیشتری دارید"
        ]
      };
    } else {
      return {
        type: "external",
        level: "مرکز کنترل بیرونی",
        color: "#ef4444",
        percentage: Math.round((externalCount / totalQuestions) * 100),
        desc: "اعتقاد به کنترل شانس، سرنوشت یا دیگران بر زندگی - نه خود.",
        problems: [
          "تلاش کمتر برای تغییر وضعیت",
          "احساس ناتوانی و درماندگی",
          "انگیزه پایین برای پیشرفت",
          "مقابله منفعل با مشکلات",
          "احتمال افسردگی بیشتر"
        ],
        guidance: [
          "شناسایی چیزهایی که در کنترل شماست",
          "تعیین اهداف کوچک و دستیابی به آن‌ها",
          "نسبت دادن موفقیت‌ها به تلاش خود",
          "مشاوره برای تغییر باورها (CBT)",
          "پذیرفتن مسئولیت تصمیمات خود",
          "تمرین اقدام و مشاهده نتایج"
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
    const externalCount = questionsData.length - score;

    return (
      <div className="w-full flex flex-col items-center">
        <Header />
        <MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaBalanceScale className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست مرکز کنترل راتر</h1>
                <p className="text-secondaryTextColor">Rotter Locus of Control Scale</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از {questionsData.length}
              </div>
              <div className="text-lg font-semibold mb-4" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
              <div className="text-secondaryTextColor text-sm">
                <p>پاسخ‌های درونی: {score} ({Math.round((score / questionsData.length) * 100)}%)</p>
                <p>پاسخ‌های بیرونی: {externalCount} ({Math.round((externalCount / questionsData.length) * 100)}%)</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              
              {interpretation.benefits && (
                <>
                  <h4 className="text-lg font-semibold text-primaryTextColor mt-4 mb-2">مزایای مرکز کنترل درونی:</h4>
                  <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                    {interpretation.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </>
              )}

              {interpretation.problems && (
                <>
                  <h4 className="text-lg font-semibold text-red-400 mt-4 mb-2">مشکلات مرکز کنترل بیرونی:</h4>
                  <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                    {interpretation.problems.map((problem, index) => (
                      <li key={index}>{problem}</li>
                    ))}
                  </ul>
                </>
              )}

              {interpretation.caution && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">⚠️ توجه: {interpretation.caution}</p>
                </div>
              )}
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">راهنمایی و توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.guidance.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نکات مهم</h3>
              <div className="space-y-3 text-secondaryTextColor text-sm leading-relaxed">
                <p><strong className="text-primaryTextColor">مرکز کنترل:</strong> تا چه حد اعتقاد دارید بر رویدادهای زندگی کنترل دارید.</p>
                <p><strong className="text-primaryTextColor">درماندگی آموخته‌شده:</strong> مرکز کنترل بسیار بیرونی می‌تواند منجر به درماندگی آموخته‌شده شود.</p>
                <p><strong className="text-primaryTextColor">قابل تغییر:</strong> مرکز کنترل قابل تغییر است - تجربیات موفقیت و کنترل می‌توانند آن را درونی‌تر کنند.</p>
                <p><strong className="text-primaryTextColor">تحقیقات:</strong> نشان می‌دهد مرکز کنترل درونی با موفقیت، سلامت و خوشبختی همبسته است.</p>
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

  const currentQuestionData = questionsData[currentQuestion];

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaBalanceScale className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست مرکز کنترل راتر</h1>
              <p className="text-secondaryTextColor">Rotter Locus of Control Scale</p>
              <p className="text-secondaryTextColor text-sm mt-1">سوال {currentQuestion + 1} از {questionsData.length}</p>
            </div>
          </div>

          <div 
            key={`question-box-${currentQuestion}`}
            className="bg-darkThemeColor rounded-2xl p-6"
          >
            <p 
              key={`question-title-${currentQuestion}`}
              className="text-primaryTextColor font-medium mb-6 text-center"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >
              یکی از دو گزینه را انتخاب کنید:
            </p>
            <div className="space-y-4">
              <button
                key={`${currentQuestion}-option-a`}
                onClick={() => handleAnswer("a")}
                className="w-full p-6 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border-2 border-borderColor hover:border-primaryThemeColor/40 text-lg"
                style={{
                  opacity: 0,
                  animation: `testOptionFadeIn 0.4s ease-out 0.4s forwards`,
                  animationFillMode: 'forwards',
                }}
              >
                <span className="text-primaryTextColor font-medium">{currentQuestionData.text_a}</span>
              </button>
              <button
                key={`${currentQuestion}-option-b`}
                onClick={() => handleAnswer("b")}
                className="w-full p-6 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border-2 border-borderColor hover:border-primaryThemeColor/40 text-lg"
                style={{
                  opacity: 0,
                  animation: `testOptionFadeIn 0.4s ease-out 0.5s forwards`,
                  animationFillMode: 'forwards',
                }}
              >
                <span className="text-primaryTextColor font-medium">{currentQuestionData.text_b}</span>
              </button>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {Math.round(((currentQuestion + 1) / questionsData.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
              <div
                className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questionsData.length) * 100}%` }}
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
