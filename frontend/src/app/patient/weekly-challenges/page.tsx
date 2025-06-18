"use client";

import React, { useState } from 'react';
import { Award, CheckCircle, Circle, TrendingUp, Heart, Clock, Activity } from 'lucide-react';

export default function WeeklyChallenges() {
  // Sample challenge data - in a real app, this would come from an API
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: 'Daily Walk',
      description: 'Take a 30-minute walk every day this week',
      category: 'Physical Activity',
      progress: 5,
      total: 7,
      points: 100,
      deadline: '2025-06-25',
      icon: Activity,
    },
    {
      id: 2,
      title: 'Medication Adherence',
      description: 'Take all your medications on time for the entire week',
      category: 'Medication',
      progress: 7,
      total: 7,
      points: 150,
      deadline: '2025-06-25',
      completed: true,
      icon: Heart,
    },
    {
      id: 3,
      title: 'Blood Pressure Monitoring',
      description: 'Record your blood pressure readings twice daily',
      category: 'Monitoring',
      progress: 8,
      total: 14,
      points: 120,
      deadline: '2025-06-25',
      icon: TrendingUp,
    },
    {
      id: 4,
      title: 'Hydration Challenge',
      description: 'Drink at least 8 glasses of water daily',
      category: 'Nutrition',
      progress: 3,
      total: 7,
      points: 80,
      deadline: '2025-06-25',
      icon: Heart,
    },
  ]);

  const [userPoints, setUserPoints] = useState(270);
  const [userLevel, setUserLevel] = useState(3);

  const markProgress = (id) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === id && challenge.progress < challenge.total) {
        const newProgress = challenge.progress + 1;
        const completed = newProgress === challenge.total;
        
        if (completed) {
          setUserPoints(prev => prev + challenge.points);
        }
        
        return {
          ...challenge,
          progress: newProgress,
          completed
        };
      }
      return challenge;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-teal-700">Weekly Challenges</h1>
        <p className="text-gray-600">Complete challenges to improve your health and earn points</p>
      </div>

      {/* User Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-teal-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {userLevel}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Health Champion</h2>
              <p className="text-sm text-gray-600">Level {userLevel}</p>
              <div className="mt-1 h-2 w-48 bg-gray-200 rounded-full">
                <div className="h-2 bg-teal-600 rounded-full" style={{ width: `${(userPoints % 100) / 100 * 100}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{userPoints} points • {100 - (userPoints % 100)} points to next level</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Award className="h-5 w-5 text-teal-700" />
              <span>Weekly Rank: 5th</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <CheckCircle className="h-5 w-5 text-teal-700" />
              <span>Challenges Completed: 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-full">
                    {React.createElement(challenge.icon, { className: "h-5 w-5 text-teal-700" })}
                  </div>
                  <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                </div>
                <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                  {challenge.category}
                </span>
              </div>
              
              <p className="mt-3 text-sm text-gray-600">{challenge.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{challenge.progress}/{challenge.total}</span>
                </div>
                <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-teal-600'}`}
                    style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Ends {new Date(challenge.deadline).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-medium text-teal-700">{challenge.points} pts</div>
              </div>
              
              {!challenge.completed && (
                <button
                  onClick={() => markProgress(challenge.id)}
                  className="mt-4 w-full py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors text-sm font-medium"
                >
                  Record Progress
                </button>
              )}
              
              {challenge.completed && (
                <div className="mt-4 w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium text-center">
                  Challenge Completed!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Challenges */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Upcoming Challenges</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Heart className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Stress Management</h3>
                  <p className="text-sm text-gray-500">Practice meditation for 10 minutes daily</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-teal-700 text-white text-sm rounded-md hover:bg-teal-800">
                Join
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Activity className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sleep Improvement</h3>
                  <p className="text-sm text-gray-500">Get 7-8 hours of sleep each night</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-teal-700 text-white text-sm rounded-md hover:bg-teal-800">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
