import React from 'react';
import { Trophy } from 'lucide-react';

interface StreakDay {
  date: number;
  active: boolean;
  day: string;
}

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  calendarDays: StreakDay[];
  badges: string[];
}

export default function StreakCalendar({
  currentStreak,
  longestStreak,
  calendarDays,
  badges
}: StreakCalendarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Streak</h3>
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🔥</div>
          <span className="text-2xl font-bold text-accent">{currentStreak}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {currentStreak >= 7
          ? "Keep it up! You're on fire!"
          : `${7 - currentStreak} more days to reach a week!`}
      </p>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-xs text-orange-600">Current</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">{longestStreak}</div>
          <div className="text-xs text-yellow-600">Best</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={`weekday-${day}-${index}`} className="text-xs font-medium text-gray-500 text-center">
            {day.charAt(0)}
          </div>
        ))}

        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 ${
              day.active
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {day.date}
          </div>
        ))}
      </div>

      {/* Achievement Badges */}
      <div className="flex items-center justify-center space-x-2 flex-wrap">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full shadow-md"
          >
            <Trophy className="w-3 h-3" />
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}