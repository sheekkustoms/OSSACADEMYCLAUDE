import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import CourseCard from "../components/shared/CourseCard";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "development", label: "💻 Development" },
  { value: "design", label: "🎨 Design" },
  { value: "marketing", label: "📣 Marketing" },
  { value: "business", label: "💼 Business" },
  { value: "data_science", label: "📊 Data Science" },
  { value: "personal_development", label: "🌱 Personal Dev" },
];

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

export default function Courses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["allCourses"],
    queryFn: () => base44.entities.Course.filter({ is_published: true }),
  });
  const { data: enrollments = [] } = useQuery({
    queryKey: ["myEnrollments", user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || c.category === category;
    const matchDiff = difficulty === "all" || c.difficulty === difficulty;
    return matchSearch && matchCategory && matchDiff;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-500 mt-0.5">Learn, grow, and earn XP along the way</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.value)}
              className={category === cat.value
                ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white border-0 shadow-sm"
                : "text-gray-500 border-gray-200 hover:text-gray-900 bg-white"
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <Badge
              key={d}
              variant="outline"
              className={`cursor-pointer capitalize transition-colors ${
                difficulty === d
                  ? "bg-violet-100 text-violet-700 border-violet-300"
                  : "text-gray-400 border-gray-200 hover:text-gray-700"
              }`}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No courses found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments.find((e) => e.course_id === course.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}