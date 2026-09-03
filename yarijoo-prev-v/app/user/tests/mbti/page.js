"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserCircle } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("mbti");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "در یک مهمانی ترجیح می‌دهید:", E: "با افراد زیادی صحبت کنید", I: "با چند نفر خاص صحبت کنید", dim: "EI" },
    { text: "شما بیشتر یک فرد:", S: "واقع‌گرا هستید", N: "تخیلی هستید", dim: "SN" },
    { text: "در تصمیم‌گیری بیشتر به:", T: "منطق و تحلیل اهمیت می‌دهید", F: "احساسات و ارزش‌ها اهمیت می‌دهید", dim: "TF" },
    { text: "شما بیشتر:", J: "برنامه‌ریز و منظم هستید", P: "انعطاف‌پذیر و خودجوش هستید", dim: "JP" },
    { text: "انرژی خود را از کجا می‌گیرید؟", E: "از تعامل با دیگران", I: "از زمان تنهایی و تفکر", dim: "EI" },
    { text: "بیشتر به چه چیزی توجه می‌کنید؟", S: "جزئیات و واقعیت‌های ملموس", N: "الگوها و معانی کلی", dim: "SN" },
    { text: "در یک بحث، برایتان مهم‌تر است:", T: "عادلانه و منطقی بودن", F: "همدلی و درک احساسات", dim: "TF" },
    { text: "ترجیح می‌دهید:", J: "کارها را زودتر تمام کنید", P: "تا آخرین لحظه صبر کنید", dim: "JP" },
    { text: "در جمع:", E: "به راحتی صحبت می‌کنید", I: "بیشتر گوش می‌دهید", dim: "EI" },
    { text: "بیشتر علاقه‌مند به:", S: "واقعیت‌های فعلی هستید", N: "احتمالات آینده هستید", dim: "SN" },
    { text: "در قضاوت:", T: "بی‌طرف و عینی هستید", F: "شخصی و ارزش‌محور هستید", dim: "TF" },
    { text: "با موقعیت‌های جدید:", J: "ترجیح می‌دهید برنامه داشته باشید", P: "دوست دارید ببینید چه پیش می‌آید", dim: "JP" },
    { text: "پس از یک روز اجتماعی:", E: "انرژی دارید و هیجان‌زده‌اید", I: "خسته هستید و نیاز به استراحت دارید", dim: "EI" },
    { text: "در یادگیری:", S: "گام‌به‌گام و منظم پیش می‌روید", N: "از کل به جزء می‌روید", dim: "SN" },
    { text: "بیشتر ارزش می‌دهید به:", T: "صداقت و حقیقت", F: "مهربانی و همدلی", dim: "TF" },
    { text: "محیط کاری شما:", J: "منظم و سازمان‌یافته است", P: "انعطاف‌پذیر و باز است", dim: "JP" },
    { text: "ترجیح می‌دهید:", E: "در گروه کار کنید", I: "به تنهایی کار کنید", dim: "EI" },
    { text: "بیشتر به چه چیزی اعتماد دارید؟", S: "تجربه و اطلاعات واقعی", N: "شهود و احساس درونی", dim: "SN" },
    { text: "در تصمیم‌گیری‌های مهم:", T: "سر و منطقی هستید", F: "قلبی و احساسی هستید", dim: "TF" },
    { text: "برنامه‌های شما:", J: "مشخص و قطعی هستند", P: "باز و قابل تغییر هستند", dim: "JP" },
    { text: "دوست دارید:", E: "افکار خود را با صدای بلند بیان کنید", I: "قبل از صحبت، در ذهن فکر کنید", dim: "EI" },
    { text: "بیشتر به دنبال:", S: "روش‌های آزموده‌شده هستید", N: "راه‌های جدید و خلاق هستید", dim: "SN" },
    { text: "در انتقاد:", T: "مستقیم و صریح هستید", F: "محتاط و ملایم هستید", dim: "TF" },
    { text: "ترجیح می‌دهید زندگی:", J: "ساختاریافته و برنامه‌ریزی‌شده باشد", P: "خودجوش و انعطاف‌پذیر باشد", dim: "JP" },
    { text: "در محیط کار:", E: "دوست دارید اتفاقات زیادی بیفتد", I: "دوست دارید آرام و ساکت باشد", dim: "EI" },
    { text: "بیشتر کدام را می‌پسندید؟", S: "کارهای عملی و کاربردی", N: "ایده‌ها و نظریه‌ها", dim: "SN" },
    { text: "فکر می‌کنید:", T: "سر بهتر از قلب است", F: "قلب بهتر از سر است", dim: "TF" },
    { text: "در پروژه‌ها:", J: "دوست دارید زودتر شروع کنید", P: "بهترین کار را در فشار انجام می‌دهید", dim: "JP" },
    { text: "وقت آزاد خود را:", E: "با دوستان می‌گذرانید", I: "تنها یا با یک نفر نزدیک می‌گذرانید", dim: "EI" },
    { text: "بیشتر به چه چیزی اهمیت می‌دهید؟", S: "دقت و توجه به جزئیات", N: "تصویر کلی و دید بلندمدت", dim: "SN" },
    { text: "در حل اختلاف:", T: "به دنبال راه‌حل منطقی هستید", F: "به دنبال صلح و هماهنگی هستید", dim: "TF" },
    { text: "سبک زندگی شما:", J: "منظم و قابل پیش‌بینی است", P: "خودجوش و پرماجرا است", dim: "JP" },
    { text: "در گفتگو:", E: "سریع و راحت صحبت می‌کنید", I: "قبل از صحبت فکر می‌کنید", dim: "EI" },
    { text: "در توضیح دادن:", S: "مثال‌های واقعی و ملموس می‌زنید", N: "از تشبیه و استعاره استفاده می‌کنید", dim: "SN" },
    { text: "بیشتر چه چیزی شما را متقاعد می‌کند؟", T: "استدلال منطقی", F: "ارزش‌ها و احساسات", dim: "TF" },
    { text: "در برنامه‌ریزی سفر:", J: "همه چیز را از قبل رزرو می‌کنید", P: "می‌خواهید آزاد و بدون برنامه باشید", dim: "JP" },
    { text: "دوست دارید:", E: "افراد جدید بشناسید", I: "دوستان قدیمی خود را حفظ کنید", dim: "EI" },
    { text: "بیشتر کدام را ترجیح می‌دهید؟", S: "حقایق و داده‌ها", N: "ایده‌ها و احتمالات", dim: "SN" },
    { text: "در کار تیمی:", T: "روی کارایی تمرکز می‌کنید", F: "روی هماهنگی تیم تمرکز می‌کنید", dim: "TF" },
    { text: "میز کار شما:", J: "تمیز و مرتب است", P: "خلاق و شلوغ است", dim: "JP" },
    { text: "ترجیح می‌دهید:", E: "با تلفن صحبت کنید", I: "پیام بنویسید", dim: "EI" },
    { text: "در یادگیری چیز جدید:", S: "دستورالعمل‌های دقیق می‌خواهید", N: "دوست دارید خودتان کشف کنید", dim: "SN" },
    { text: "تصمیم‌های شما بیشتر بر اساس:", T: "تحلیل عینی است", F: "ارزش‌های شخصی است", dim: "TF" },
    { text: "دوست دارید:", J: "همه چیز مشخص و تعیین‌شده باشد", P: "گزینه‌ها باز باشند", dim: "JP" },
    { text: "بعد از کار:", E: "دوست دارید با همکاران وقت بگذرانید", I: "نیاز به زمان تنهایی دارید", dim: "EI" },
    { text: "بیشتر چه چیزی توجه شما را جلب می‌کند؟", S: "آنچه هست", N: "آنچه می‌تواند باشد", dim: "SN" },
    { text: "در ارزیابی موقعیت:", T: "بی‌طرف و عینی هستید", F: "شخصی و ذهنی هستید", dim: "TF" },
    { text: "ترجیح می‌دهید:", J: "تصمیمات را سریع بگیرید", P: "گزینه‌ها را باز نگه دارید", dim: "JP" },
    { text: "در مهمانی:", E: "معمولاً تا آخر می‌مانید", I: "زود می‌روید", dim: "EI" },
    { text: "بیشتر به چه چیزی اعتماد دارید؟", S: "حواس پنج‌گانه شما", N: "شهود و احساس شما", dim: "SN" },
    { text: "فکر می‌کنید:", T: "عدالت مهم‌تر از رحم است", F: "رحم مهم‌تر از عدالت است", dim: "TF" },
    { text: "زندگی روزمره شما:", J: "طبق برنامه پیش می‌رود", P: "غیرقابل پیش‌بینی است", dim: "JP" },
    { text: "ترجیح می‌دهید:", E: "حرف بزنید تا فکر کنید", I: "فکر کنید تا حرف بزنید", dim: "EI" },
    { text: "در حل مشکل:", S: "از تجربه گذشته استفاده می‌کنید", N: "راه‌حل‌های جدید امتحان می‌کنید", dim: "SN" },
    { text: "در قضاوت درباره افراد:", T: "منصفانه اما سخت‌گیر هستید", F: "درک‌کننده و بخشنده هستید", dim: "TF" },
    { text: "کارهای نیمه‌تمام:", J: "شما را ناراحت می‌کند", P: "برایتان عادی است", dim: "JP" },
    { text: "دوست دارید:", E: "در مرکز توجه باشید", I: "در پشت صحنه باشید", dim: "EI" },
    { text: "بیشتر علاقه‌مند به:", S: "واقعیت و عمل هستید", N: "خیال و نظریه هستید", dim: "SN" },
    { text: "در تصمیم‌گیری:", T: "منطق را در اولویت قرار می‌دهید", F: "احساسات را در اولویت قرار می‌دهید", dim: "TF" },
    { text: "ترجیح می‌دهید:", J: "همه چیز در کنترل باشد", P: "همه چیز باز و انعطاف‌پذیر باشد", dim: "JP" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (choice) => {
    const q = questions[currentQuestion];
    const newAnswers = { ...answers, [currentQuestion]: { choice, dimension: q.dim } };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };
  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        try {
          const score = Object.values(answers).reduce((sum, val) => {
            if (typeof val === 'object' && val.value) return sum + val.value;
            return sum + (val || 0);
          }, 0);
          const interpretation = { level: 'متوسط', color: '#eab308', desc: '' };
          
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            if (typeof answer === 'object' && answer.value !== undefined) return answer.value;
            return answer !== undefined ? answer : 0;
          });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: score,
            total_score: score,
            level: interpretation.level || interpretation.level || 'متوسط',
            interpretation: interpretation,
            
          });
          
          if (saved && saved.success) {
            setIsCompleted(true);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, hasResult, answers, questions, saveResult]);



  const calculatePersonalityType = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    Object.values(answers).forEach(answer => {
      scores[answer.choice]++;
    });

    const type = 
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P');

    return { type, scores };
  };

  const getPersonalityInfo = (type) => {
    const personalities = {
      ISTJ: { 
        title: "بازرس", 
        nickname: "The Inspector", 
        desc: "منطقی، عملی، منظم و قابل اعتماد",
        details: "ISTJها افرادی مسئولیت‌پذیر و قابل اعتماد هستند که به نظم، وظیفه و سنت اهمیت می‌دهند. آن‌ها با دقت کار می‌کنند و به جزئیات توجه دارند.",
        strengths: ["مسئولیت‌پذیری بالا", "دقت و نظم", "قابل اعتماد", "منطقی و عملی", "پایبند به تعهدات"],
        recommendations: ["توجه به احساسات خود و دیگران", "انعطاف بیشتر در برابر تغییرات", "زمان برای استراحت و تفریح"],
        color: "#4A90E2" 
      },
      ISFJ: { 
        title: "محافظ", 
        nickname: "The Protector", 
        desc: "مهربان، دقیق، وفادار و صبور",
        details: "ISFJها افرادی مراقب و فداکار هستند که از کمک به دیگران لذت می‌برند. آن‌ها با دقت به نیازهای اطرافیان توجه می‌کنند و به روابط پایدار ارزش می‌دهند.",
        strengths: ["مراقبت و همدلی", "وفاداری بالا", "حافظه قوی", "دقت در کار", "صبر و شکیبایی"],
        recommendations: ["قائل شدن حد و مرز شخصی", "توجه بیشتر به نیازهای خود", "پذیرش تغییرات"],
        color: "#7B68EE" 
      },
      INFJ: { 
        title: "مشاور", 
        nickname: "The Counselor", 
        desc: "عمیق، خلاق، الهام‌بخش و ایده‌آل‌گرا",
        details: "INFJها نادرترین تیپ شخصیتی هستند. آن‌ها بینش عمیقی درباره مردم دارند، ایده‌آل‌گرا و الهام‌بخش هستند و برای ایجاد تغییرات مثبت تلاش می‌کنند.",
        strengths: ["بینش عمیق", "خلاقیت", "همدلی بالا", "تعهد به ارزش‌ها", "الهام‌بخشی"],
        recommendations: ["توجه به واقعیت‌ها", "مراقبت از خود", "پذیرش نقص در دیگران"],
        color: "#9B59B6" 
      },
      INTJ: { 
        title: "معمار", 
        nickname: "The Mastermind", 
        desc: "استراتژیک، مستقل، تحلیل‌گر و خلاق",
        details: "INTJها فکورانی استراتژیک هستند که به دنبال بهبود سیستم‌ها و فرآیندها می‌گردند. آن‌ها مستقل، خلاق و دارای استانداردهای بالا هستند.",
        strengths: ["تفکر استراتژیک", "استقلال", "تحلیل منطقی", "بلندپروازی", "خلاقیت سیستماتیک"],
        recommendations: ["توجه به احساسات", "صبر با دیگران", "انعطاف در برنامه‌ها"],
        color: "#5F27CD" 
      },
      ISTP: { 
        title: "صنعتگر", 
        nickname: "The Craftsman", 
        desc: "عملی، منعطف، تحلیل‌گر و آرام",
        details: "ISTPها حل‌کننده مسئله هستند که از کار با ابزار و دست لذت می‌برند. آن‌ها منعطف، عملی و تحلیل‌گر هستند.",
        strengths: ["مهارت‌های فنی", "حل مسئله", "آرامش در بحران", "انعطاف‌پذیری", "تحلیل منطقی"],
        recommendations: ["برنامه‌ریزی بلندمدت", "ابراز احساسات", "تعهد به روابط"],
        color: "#00B894" 
      },
      ISFP: { 
        title: "هنرمند", 
        nickname: "The Composer", 
        desc: "حساس، مهربان، انعطاف‌پذیر و هنری",
        details: "ISFPها افرادی حساس و هنری هستند که در لحظه زندگی می‌کنند. آن‌ها مهربان، منعطف و دارای حس زیباشناسی قوی هستند.",
        strengths: ["حساسیت هنری", "مهربانی", "انعطاف‌پذیری", "زندگی در لحظه", "احترام به دیگران"],
        recommendations: ["برنامه‌ریزی برای آینده", "ابراز نیازها", "مقابله با تعارض"],
        color: "#FD79A8" 
      },
      INFP: { 
        title: "میانجی", 
        nickname: "The Healer", 
        desc: "ایده‌آل‌گرا، وفادار، کنجکاو و خلاق",
        details: "INFPها ایده‌آل‌گرایانی هستند که به دنبال معنا و هدف در زندگی می‌گردند. آن‌ها خلاق، همدل و متعهد به ارزش‌های خود هستند.",
        strengths: ["خلاقیت", "همدلی عمیق", "وفاداری", "کنجکاوی", "تعهد به ارزش‌ها"],
        recommendations: ["عملگرایی بیشتر", "پذیرش واقعیت", "مدیریت زمان"],
        color: "#A29BFE" 
      },
      INTP: { 
        title: "اندیشمند", 
        nickname: "The Architect", 
        desc: "منطقی، تحلیل‌گر، نظریه‌پرداز و خلاق",
        details: "INTPها نظریه‌پردازانی منطقی هستند که از کاوش ایده‌های پیچیده لذت می‌برند. آن‌ها تحلیل‌گر، کنجکاو و دارای تفکر مستقل هستند.",
        strengths: ["تفکر تحلیلی", "خلاقیت نظری", "کنجکاوی", "استقلال فکری", "منطق قوی"],
        recommendations: ["توجه به جنبه‌های عملی", "ارتباطات اجتماعی", "پایان دادن به پروژه‌ها"],
        color: "#6C5CE7" 
      },
      ESTP: { 
        title: "کارآفرین", 
        nickname: "The Dynamo", 
        desc: "پرانرژی، عملی، واقع‌گرا و اجتماعی",
        details: "ESTPها پرانرژی و اجتماعی هستند که از عمل و هیجان لذت می‌برند. آن‌ها عملگرا، سازگار و دارای مهارت حل مسئله هستند.",
        strengths: ["انرژی بالا", "عملگرایی", "سازگاری", "حل مسئله سریع", "شجاعت"],
        recommendations: ["برنامه‌ریزی بلندمدت", "توجه به پیامدها", "صبر و تحمل"],
        color: "#FF7675" 
      },
      ESFP: { 
        title: "سرگرم‌کننده", 
        nickname: "The Performer", 
        desc: "شاد، دوستانه، خودجوش و صمیمی",
        details: "ESFPها افرادی شاد و اجتماعی هستند که از لذت بردن از زندگی و شاد کردن دیگران لذت می‌برند. آن‌ها خودجوش، دوستانه و پرانرژی هستند.",
        strengths: ["شادی‌آفرینی", "اجتماعی بودن", "خودجوشی", "عملگرایی", "انعطاف‌پذیری"],
        recommendations: ["برنامه‌ریزی مالی", "تفکر بلندمدت", "پایداری در تعهدات"],
        color: "#FDCB6E" 
      },
      ENFP: { 
        title: "مبلغ", 
        nickname: "The Champion", 
        desc: "مشتاق، خلاق، اجتماعی و خوش‌بین",
        details: "ENFPها افرادی مشتاق و خلاق هستند که از کشف امکانات جدید لذت می‌برند. آن‌ها اجتماعی، الهام‌بخش و دارای حس قوی برای ارزش‌ها هستند.",
        strengths: ["خلاقیت", "اشتیاق", "الهام‌بخشی", "ارتباطات قوی", "انعطاف‌پذیری"],
        recommendations: ["تمرکز و انضباط", "پایان دادن به کارها", "مدیریت زمان"],
        color: "#FFA502" 
      },
      ENTP: { 
        title: "بحث‌کننده", 
        nickname: "The Visionary", 
        desc: "هوشمند، کنجکاو، خلاق و بحث‌انگیز",
        details: "ENTPها نوآورانی هوشمند هستند که از چالش‌های فکری لذت می‌برند. آن‌ها کنجکاو، بحث‌انگیز و دارای تفکر سریع هستند.",
        strengths: ["نوآوری", "تفکر سریع", "بحث و جدل", "کنجکاوی", "انعطاف ذهنی"],
        recommendations: ["پیگیری پروژه‌ها", "حساسیت به احساسات", "تعهد به برنامه‌ها"],
        color: "#FF6348" 
      },
      ESTJ: { 
        title: "مدیر اجرایی", 
        nickname: "The Supervisor", 
        desc: "عملی، سازمان‌دهنده، منطقی و قاطع",
        details: "ESTJها مدیران طبیعی هستند که در سازماندهی و اجرا تخصص دارند. آن‌ها عملگرا، قاطع و متعهد به نتایج هستند.",
        strengths: ["رهبری", "سازماندهی", "قاطعیت", "مسئولیت‌پذیری", "کارایی"],
        recommendations: ["انعطاف بیشتر", "گوش دادن به دیگران", "توجه به احساسات"],
        color: "#1E3799" 
      },
      ESFJ: { 
        title: "حامی", 
        nickname: "The Provider", 
        desc: "مهربان، سازمان‌دهنده، دوستانه و وفادار",
        details: "ESFJها افرادی مراقب و اجتماعی هستند که از ایجاد هماهنگی و کمک به دیگران لذت می‌برند. آن‌ها سازمان‌دهنده، مهربان و متعهد به جامعه هستند.",
        strengths: ["مراقبت از دیگران", "سازماندهی", "وفاداری", "مسئولیت اجتماعی", "دوستانه بودن"],
        recommendations: ["قائل شدن حد و مرز", "توجه به نیازهای خود", "پذیرش انتقاد"],
        color: "#F8B500" 
      },
      ENFJ: { 
        title: "معلم", 
        nickname: "The Teacher", 
        desc: "کاریزماتیک، الهام‌بخش، رهبر و دلسوز",
        details: "ENFJها رهبرانی کاریزماتیک هستند که دیگران را الهام می‌بخشند و به رشد آن‌ها کمک می‌کنند. آن‌ها همدل، سازمان‌دهنده و متعهد به بهبود جامعه هستند.",
        strengths: ["رهبری الهام‌بخش", "همدلی", "ارتباطات عالی", "سازماندهی", "انگیزه‌دهی"],
        recommendations: ["مراقبت از خود", "پذیرش نقص دیگران", "استراحت کافی"],
        color: "#EE5A6F" 
      },
      ENTJ: { 
        title: "فرمانده", 
        nickname: "The Commander", 
        desc: "رهبر، استراتژیک، قاطع و منطقی",
        details: "ENTJها رهبران طبیعی و استراتژیک هستند که به دنبال کارایی و پیشرفت می‌گردند. آن‌ها قاطع، منطقی و دارای چشم‌انداز بلندمدت هستند.",
        strengths: ["رهبری قوی", "تفکر استراتژیک", "قاطعیت", "کارایی", "اعتماد به نفس"],
        recommendations: ["حساسیت به احساسات", "صبر با دیگران", "انعطاف در رویکرد"],
        color: "#C23616" 
      }
    };

    return personalities[type] || personalities.INTP;
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
    const { type, scores } = calculatePersonalityType();
    const personalityInfo = getPersonalityInfo(type);

    const chartData = {
      labels: ['E vs I', 'S vs N', 'T vs F', 'J vs P'],
      datasets: [{
        label: 'امتیازات شما',
        data: [
          scores.E - scores.I,
          scores.S - scores.N,
          scores.T - scores.F,
          scores.J - scores.P
        ],
        backgroundColor: personalityInfo.color + '33',
        borderColor: personalityInfo.color,
        borderWidth: 2,
        pointBackgroundColor: personalityInfo.color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: personalityInfo.color
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
                <FaUserCircle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست شخصیت MBTI</h1>
                <p className="text-secondaryTextColor">تیپ شخصیتی شما</p>
              </div>
            </div>

            <div 
              className="bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 rounded-2xl p-8 border-2 border-primaryThemeColor/30"
              style={{ borderColor: personalityInfo.color + '50' }}
            >
              <div className="text-center">
                <div 
                  className="text-6xl font-bold mb-4" 
                  style={{ color: personalityInfo.color }}
                >
                  {type}
                </div>
                <h2 className="text-3xl font-bold text-primaryTextColor mb-2">
                  {personalityInfo.title}
                </h2>
                <p className="text-lg text-secondaryTextColor mb-4">
                  {personalityInfo.nickname}
                </p>
                <p className="text-primaryTextColor text-lg">
                  {personalityInfo.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">
                  انرژی: {scores.E > scores.I ? 'برونگرا (E)' : 'درونگرا (I)'}
                </h3>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(Math.max(scores.E, scores.I) / 15) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-secondaryTextColor mt-2">
                  <span>E: {scores.E}</span>
                  <span>I: {scores.I}</span>
                </div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">
                  درک: {scores.S > scores.N ? 'حسی (S)' : 'شهودی (N)'}
                </h3>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(Math.max(scores.S, scores.N) / 15) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-secondaryTextColor mt-2">
                  <span>S: {scores.S}</span>
                  <span>N: {scores.N}</span>
                </div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">
                  تصمیم: {scores.T > scores.F ? 'تفکری (T)' : 'احساسی (F)'}
                </h3>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(Math.max(scores.T, scores.F) / 15) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-secondaryTextColor mt-2">
                  <span>T: {scores.T}</span>
                  <span>F: {scores.F}</span>
                </div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">
                  سبک: {scores.J > scores.P ? 'قضاوتی (J)' : 'ادراکی (P)'}
                </h3>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(Math.max(scores.J, scores.P) / 15) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-secondaryTextColor mt-2">
                  <span>J: {scores.J}</span>
                  <span>P: {scores.P}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره MBTI</h4>
              <p className="text-sm text-blue-300">
                MBTI (Myers-Briggs Type Indicator) یک ابزار خودشناسی است که شما را با یکی از 16 تیپ شخصیتی آشنا می‌کند. 
                این تست نشان‌دهنده ترجیحات طبیعی شما است، نه توانایی‌هایتان. همه تیپ‌ها ارزشمند هستند و هر کس می‌تواند 
                در هر شغلی موفق شود.
              </p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار ابعاد شخصیتی</h3>
              <div className="w-full h-96 flex items-center justify-center">
                <Radar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { 
                      display: true, 
                      text: 'نمودار تعادل ابعاد شخصیتی شما',
                      color: '#e5e7eb',
                      font: { size: 16 }
                    }
                  },
                  scales: {
                    r: {
                      ticks: { 
                        color: '#9ca3af',
                        backdropColor: 'transparent'
                      },
                      grid: { color: '#374151' },
                      angleLines: { color: '#374151' },
                      pointLabels: { 
                        color: '#e5e7eb',
                        font: { size: 12 }
                      }
                    }
                  }
                }} />
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-amber-400 mb-3">⚠️ نکته مهم</h4>
              <p className="text-sm text-amber-300">
                از نتایج برای خودشناسی و بهبود استفاده کنید، نه برای محدود کردن خود یا دیگران. 
                شما می‌توانید مهارت‌های خارج از تیپ خود را نیز توسعه دهید.
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

  const q = questions[currentQuestion];

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaUserCircle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست شخصیت MBTI</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-primaryTextColor mb-6 text-center">
              {q.text}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleAnswer(q.dim[0])}
                className="w-full p-6 text-center bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border-2 border-borderColor hover:border-primaryThemeColor/40 transition-all"
              >
                <span className="text-primaryTextColor font-medium text-lg">{q[q.dim[0]]}</span>
              </button>
              <button
                onClick={() => handleAnswer(q.dim[1])}
                className="w-full p-6 text-center bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border-2 border-borderColor hover:border-primaryThemeColor/40 transition-all"
              >
                <span className="text-primaryTextColor font-medium text-lg">{q[q.dim[1]]}</span>
              </button>
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





