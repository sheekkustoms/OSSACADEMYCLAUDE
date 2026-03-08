import { base44 } from "@/api/base44Client";
import { getLevelFromXP } from "./XPBar";

export async function getOrCreateUserPoints(user) {
  if (!user?.email) return null;
  const existing = await base44.entities.UserPoints.filter({ user_email: user.email });
  if (existing.length > 0) return existing[0];
  return await base44.entities.UserPoints.create({
    user_email: user.email,
    user_name: user.full_name || user.email,
    total_xp: 0,
    level: 1,
    courses_completed: 0,
    lessons_completed: 0,
    posts_created: 0,
    comments_made: 0,
    badges: [],
    streak_days: 0,
    last_activity_date: new Date().toISOString().split("T")[0],
  });
}

export async function awardXP(userPointsId, currentPoints, amount, extraUpdates = {}) {
  const newXP = (currentPoints.total_xp || 0) + amount;
  const newLevel = getLevelFromXP(newXP);
  const today = new Date().toISOString().split("T")[0];

  const badges = [...(currentPoints.badges || [])];

  // Check badge eligibility
  const lessonsCompleted = (extraUpdates.lessons_completed || currentPoints.lessons_completed || 0);
  const coursesCompleted = (extraUpdates.courses_completed || currentPoints.courses_completed || 0);
  const postsCreated = (extraUpdates.posts_created || currentPoints.posts_created || 0);
  const commentsMade = (extraUpdates.comments_made || currentPoints.comments_made || 0);

  if (lessonsCompleted >= 1 && !badges.includes("First Lesson")) badges.push("First Lesson");
  if (coursesCompleted >= 1 && !badges.includes("Course Complete")) badges.push("Course Complete");
  if (coursesCompleted >= 5 && !badges.includes("Sharpshooter")) badges.push("Sharpshooter");
  if (postsCreated >= 5 && !badges.includes("Community Star")) badges.push("Community Star");
  if (commentsMade >= 10 && !badges.includes("Commenter")) badges.push("Commenter");
  if (newLevel >= 5 && !badges.includes("Rocket Learner")) badges.push("Rocket Learner");
  if (newLevel >= 10 && !badges.includes("Legend")) badges.push("Legend");

  let streakDays = currentPoints.streak_days || 0;
  if (currentPoints.last_activity_date !== today) {
    const lastDate = new Date(currentPoints.last_activity_date);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    streakDays = diffDays === 1 ? streakDays + 1 : 1;
  }

  if (streakDays >= 7 && !badges.includes("On Fire")) badges.push("On Fire");

  await base44.entities.UserPoints.update(userPointsId, {
    total_xp: newXP,
    level: newLevel,
    badges,
    streak_days: streakDays,
    last_activity_date: today,
    ...extraUpdates,
  });

  return { total_xp: newXP, level: newLevel, badges, streak_days: streakDays };
}