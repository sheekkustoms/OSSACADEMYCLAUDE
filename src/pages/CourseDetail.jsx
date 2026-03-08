import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, CheckCircle2, Circle, ArrowLeft, Zap, Clock, BookOpen, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getOrCreateUserPoints, awardXP } from "../components/shared/useUserPoints";

export default function CourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const sortedLessons = useMemo(() => [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0)), [lessons]);

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", courseId, user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({
        user_email: user.email,
        course_id: courseId,
      });
      return enrollments[0] || null;
    },
    enabled: !!user?.email && !!courseId,
  });

  const { data: myPoints } = useQuery({
    queryKey: ["myPointsDetail", user?.email],
    queryFn: () => getOrCreateUserPoints(user),
    enabled: !!user?.email,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Enrollment.create({
        user_email: user.email,
        course_id: courseId,
        completed_lessons: [],
        progress_percent: 0,
        is_completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId) => {
      if (!enrollment) return;
      const completed = [...(enrollment.completed_lessons || [])];
      if (completed.includes(lessonId)) return;
      completed.push(lessonId);
      const totalLessons = sortedLessons.length;
      const progress = Math.round((completed.length / totalLessons) * 100);
      const isCompleted = progress >= 100;

      await base44.entities.Enrollment.update(enrollment.id, {
        completed_lessons: completed,
        progress_percent: progress,
        is_completed: isCompleted,
      });

      if (myPoints) {
        const lesson = sortedLessons.find((l) => l.id === lessonId);
        const xpAmount = lesson?.xp_reward || 20;
        const extraUpdates = {
          lessons_completed: (myPoints.lessons_completed || 0) + 1,
        };
        if (isCompleted) {
          extraUpdates.courses_completed = (myPoints.courses_completed || 0) + 1;
          const courseXP = course?.xp_reward || 100;
          await awardXP(myPoints.id, myPoints, xpAmount + courseXP, extraUpdates);
        } else {
          await awardXP(myPoints.id, myPoints, xpAmount, extraUpdates);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["myPointsDetail"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardPoints"] });
      queryClient.invalidateQueries({ queryKey: ["myPoints"] });
      queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
  });

  const completedLessons = enrollment?.completed_lessons || [];
  const activeLesson = selectedLesson || sortedLessons.find((l) => !completedLessons.includes(l.id)) || sortedLessons[0];

  if (courseLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-80 bg-slate-800/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-slate-400">Course not found</p>
        <Link to={createPageUrl("Courses")}>
          <Button variant="outline" className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const difficultyColor = {
    beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to={createPageUrl("Courses")} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
            {activeLesson?.video_url ? (
              <video
                key={activeLesson.id}
                controls
                className="w-full h-full object-contain"
                src={activeLesson.video_url}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Play className="w-16 h-16 mb-2" />
                <p className="text-sm">{enrollment ? "Select a lesson to start" : "Enroll to start learning"}</p>
              </div>
            )}
          </div>

          {/* Lesson info */}
          {activeLesson && (
            <div>
              <h2 className="text-xl font-semibold text-white">{activeLesson.title}</h2>
              {activeLesson.description && (
                <p className="text-sm text-slate-400 mt-2">{activeLesson.description}</p>
              )}
              {enrollment && !completedLessons.includes(activeLesson.id) && (
                <Button
                  onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                  disabled={completeLessonMutation.isPending}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete (+{activeLesson.xp_reward || 20} XP)
                </Button>
              )}
              {enrollment && completedLessons.includes(activeLesson.id) && (
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Lesson completed
                </div>
              )}
            </div>
          )}

          {/* Course details */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
            <p className="text-sm text-slate-400">{course.description}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge className={`${difficultyColor[course.difficulty]} border`}>{course.difficulty}</Badge>
              <Badge variant="outline" className="text-slate-400 border-slate-700/40 capitalize">{course.category?.replace(/_/g, " ")}</Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-3 h-3 mr-1" /> +{course.xp_reward || 100} XP
              </Badge>
            </div>
          </div>
        </div>

        {/* Sidebar - Lessons list */}
        <div className="space-y-4">
          {!enrollment ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-center"
            >
              <BookOpen className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Ready to learn?</h3>
              <p className="text-sm text-indigo-200 mb-4">Enroll now and start earning XP</p>
              <Button
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
              >
                Enroll for Free
              </Button>
            </motion.div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-white">Progress</span>
                <span className="text-sm text-indigo-400 font-semibold">{enrollment.progress_percent}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progress_percent}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/30">
              <h3 className="text-sm font-semibold text-white">Lessons ({sortedLessons.length})</h3>
            </div>
            <div className="divide-y divide-slate-700/20 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {sortedLessons.map((lesson, i) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => enrollment && setSelectedLesson(lesson)}
                      disabled={!enrollment}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                        isActive ? "bg-indigo-500/10" : "hover:bg-slate-700/20"
                      } ${!enrollment ? "opacity-50" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : !enrollment ? (
                        <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      ) : (
                        <Circle className={`w-5 h-5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-600"}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isCompleted ? "text-slate-400" : "text-white"}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {lesson.duration_minutes > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {lesson.duration_minutes}m
                            </span>
                          )}
                          <span className="flex items-center gap-0.5 text-emerald-500">
                            <Zap className="w-3 h-3" /> +{lesson.xp_reward || 20}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}