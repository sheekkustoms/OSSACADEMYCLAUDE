import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    id: "welcome_video",
    label: "Watch the Welcome Video",
    description: "Get oriented with a quick intro from your coach.",
    cta: "Go to Welcome Class",
    page: "Classes",
  },
  {
    id: "intro_post",
    label: "Introduce Yourself in the Community",
    description: "Say hi! Tell us who you are and what you're excited to sew.",
    cta: "Post Your Intro",
    page: "Community",
  },
  {
    id: "first_class",
    label: "Enroll in Your First Class",
    description: "Pick a course and start your sewing journey.",
    cta: "View Classes",
    page: "Courses",
  },
  {
    id: "starter_pattern",
    label: "Download Your Starter Pattern",
    description: "Grab your first pattern PDF from the live class library.",
    cta: "Go to Sewing Patterns",
    page: "LiveClasses",
  },
];

export default function OnboardingModal({ onClose, completedSteps, onMarkStep }) {
  const [phase, setPhase] = useState("welcome"); // "welcome" | "checklist"

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Top gradient band */}
            <div className="h-2 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400" />

            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Welcome to SEW SHEEK ACADEMY
                </h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  You're in the room where sewists become <span className="font-semibold text-gray-700">SHEEK.</span>
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  onClick={() => setPhase("checklist")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-xl font-semibold gap-2"
                >
                  Start Tour <ArrowRight className="w-4 h-4" />
                </Button>
                <button
                  onClick={onClose}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "checklist" && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400" />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Get Started</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {completedSteps.length} of {STEPS.length} completed
                  </p>
                </div>
                <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <motion.div
                  className="bg-gray-900 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {STEPS.map((step, i) => {
                  const done = completedSteps.includes(step.id);
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                        done ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <button
                        onClick={() => onMarkStep(step.id)}
                        className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                      >
                        {done
                          ? <CheckCircle2 className="w-5 h-5 text-gray-700" />
                          : <Circle className="w-5 h-5 text-gray-300" />
                        }
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${done ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {step.label}
                        </p>
                        {!done && (
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                        )}
                      </div>

                      {!done && (
                        <Link to={createPageUrl(step.page)} onClick={onClose}>
                          <Button size="sm" variant="outline" className="shrink-0 border-gray-200 text-gray-700 text-xs h-8 whitespace-nowrap hover:bg-gray-50">
                            {step.cta}
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {completedSteps.length === STEPS.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-200 rounded-xl p-4 text-center"
                >
                  <p className="font-bold text-gray-900">🎉 You're all set!</p>
                  <p className="text-sm text-gray-500 mt-1">Your Academy experience is fully set up.</p>
                  <Button onClick={onClose} className="mt-3 bg-gray-900 hover:bg-gray-800 text-white h-9 px-6 rounded-lg text-sm">
                    Go to Dashboard
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}