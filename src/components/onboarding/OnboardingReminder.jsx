import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, X } from "lucide-react";

const STEP_LABELS = [
  { id: "welcome_video",    label: "Watch the Welcome Video" },
  { id: "intro_post",       label: "Introduce Yourself" },
  { id: "first_class",      label: "Enroll in a Class" },
  { id: "starter_pattern",  label: "Download Starter Pattern" },
];

export default function OnboardingReminder({ completedSteps, onOpen, onDismiss }) {
  const remaining = STEP_LABELS.length - completedSteps.length;
  if (remaining === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Finish setting up your Academy experience</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {completedSteps.length} of {STEP_LABELS.length} steps complete
          </p>

          {/* Mini progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-gray-800 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.length / STEP_LABELS.length) * 100}%` }}
            />
          </div>

          {/* Step pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {STEP_LABELS.map(s => {
              const done = completedSteps.includes(s.id);
              return (
                <span
                  key={s.id}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                    done
                      ? "bg-gray-100 text-gray-400 line-through"
                      : "bg-pink-50 text-pink-700 border border-pink-200"
                  }`}
                >
                  {done
                    ? <CheckCircle2 className="w-3 h-3" />
                    : <Circle className="w-3 h-3" />
                  }
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpen}
            className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            Continue <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}