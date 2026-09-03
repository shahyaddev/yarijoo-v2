"use client";

import { toFarsiNumber } from "@/helper/helper";
import React, { useEffect, useState } from "react";
import { Button, Radio, RadioGroup, Spinner } from "@nextui-org/react";
import { getData, postData } from "@/services/API";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const AHSTest = () => {
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [activeQs, setActiveQs] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getData("/tests/ahs/questions")
      .then((res) => {
        const newStructure = [];
        res.data.forEach((item) => {
          newStructure.push({
            ...item,
            an: [
              { key: 1, label: "کاملا مخالفم", value: 1, default: false },
              { key: 2, label: "مخالفم", value: 2, default: false },
              { key: 2, label: "نظری ندارم", value: 3, default: false },
              { key: 2, label: "کاملا موافیم", value: 4, default: false },
              { key: 2, label: "موافیم", value: 5, default: false },
            ],
          });
        });

        setQuestions(newStructure);
        setQuestionsLoading(false);
      })
      .catch((err) => {
        toast.error("خطا هنگام دریافت سوالات");
      });
  }, []);

  const nextQuestionHandler = (id, data) => {
    // set answer
    setSelectedAnswer(data);

    // next question
    setActiveQs((prev) => prev + 1);

    // clear answer
    setSelectedAnswer("");

    // save answers
    setAnswers((prev) => [...prev, { question_id: id, score: data }]);
  };

  const previousQuestionHandler = () => {
    // set active question
    setActiveQs(answers[answers.length - 1].question_id - 1);

    // set previous question answer
    setSelectedAnswer(answers[answers.length - 1].answer);

    // delete last question answer
    setAnswers((previousArr) => previousArr.slice(0, -1));

    // cancel loading
    setLoading(false);
  };

  // submit test
  const submitTestHandler = () => {
    setLoading(true);
    postData("/tests/ahs/answers-submit", {
      responses: answers,
    })
      .then((res) => {
        // setLoading(false);

        router.refresh();
      })
      .catch((err) => {
        setLoading(false);

        toast.error("خطا هنگام ثبت تست شما");
      });
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <Toaster />

      {questionsLoading ? (
        <Spinner
          label="لطفا صبر کنید..."
          classNames={{
            label: "text-primaryTextColor",
            circle1: "border-b-primaryThemeColor",
            circle2: "border-b-primaryThemeColor",
          }}
        />
      ) : (
        <>
          {/* test numbers */}
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between text-primaryTextColor items-center">
              <div className="flex items-center text-lg gap-[2px]">
                <span>{toFarsiNumber(questions.length)}</span>
                <span>/</span>
                <span className="text-primaryThemeColor">
                  {activeQs < 11
                    ? toFarsiNumber(activeQs + 1)
                    : toFarsiNumber(12)}
                </span>
              </div>

              <span className="hidden md:block text-xl font-black text-primaryTextColor">
                تست امید به زندگی اشنایدر
              </span>

              <button
                onClick={previousQuestionHandler}
                disabled={activeQs === 0}
                className="flex items-center disabled:opacity-70 gap-2 text-danger"
              >
                <span>سوال قبلی</span>
                <i className="fi fi-rr-arrow-left h-4"></i>
              </button>
            </div>

            <div className="w-full h-2 rounded-full bg-darkThemeColor">
              <div
                style={{
                  width: `${(100 / questions.length) * activeQs}%`,
                }}
                className="w-40 h-full bg-primaryThemeColor rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          {/* test */}
          <div className="w-full flex max-w-[420px] flex-col items-center gap-6">
            {activeQs < 12 ? (
              questions.map(
                (question, i) =>
                  activeQs === i && (
                    <div
                      key={question.id}
                      className="w-full flex flex-col gap-4 fade-animate"
                    >
                      <p className="text-lg text-primaryTextColor font-bold">
                        <span>{toFarsiNumber(i + 1)}.</span> {question.text}
                      </p>

                      <RadioGroup
                        value={selectedAnswer}
                        onValueChange={(data) =>
                          nextQuestionHandler(question.id, data)
                        }
                        classNames={{ wrapper: "gap-4" }}
                      >
                        {question.an.map((answer, index) => (
                          <Radio
                            key={index}
                            classNames={{
                              control: "!bg-primaryThemeColor",
                              wrapper:
                                "border-secondaryTextColor group-data-[selected=true]:!border-primaryThemeColor group-data-[hover-unselected=true]:!bg-[#444]",
                              label: "!text-secondaryTextColor",
                            }}
                            value={answer.value}
                          >
                            {answer.label}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>
                  )
              )
            ) : (
              <div className="w-full flex flex-col gap-6">
                <p className="text-primaryTextColor text-sm">
                  شما با موفقیت با سوالات پاسخ داده اید. اگر از پاسخ های خود
                  مطمئن هستید بر روی دکمه مشاهده نتیجه تست کلیک کنید تا نتیجه
                  تست خود را مشاهده کنید در غیر این صورت بر روی دکمه سوال قبلی
                  کلیک کنید تا مجدد به سوالات مورد نظر پاسخ دهید.
                </p>

                <Button
                  isLoading={loading}
                  onPress={submitTestHandler}
                  className="bg-primaryThemeColor w-full text-darkThemeColor !shadow-lg"
                  variant="shadow"
                >
                  مشاهده نتیجه تست
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AHSTest;
