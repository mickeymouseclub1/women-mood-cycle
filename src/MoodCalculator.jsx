import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Heart, TrendingUp, AlertCircle, CalendarDays, Users, BarChart3, ChevronLeft, ChevronRight, Target } from 'lucide-react';


const MoodCalculator = () => {
  const [inputDate, setInputDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('scenarios');

 const API_URL = process.env.REACT_APP_API_URL || "https://women-mood-5.onrender.com";

const calculateMood = async () => {
  if (!inputDate) return;

  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: inputDate }),
    });

    if (!response.ok) {
      console.error("Server error:", response.statusText);
      alert("Error from server: " + response.status);
      return;
    }

    const data = await response.json();

    setResults(data);
    setSelectedScenario(0);
    setCalendarDate(new Date(inputDate));
  } catch (err) {
    console.error("Network error:", err);
    alert("Network error: " + err.message);
  } finally {
    setLoading(false);
  }
};

      
  const getMoodColor = (mood) => {
    if (mood >= 75) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (mood >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (mood >= 45) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getMoodLabel = (mood, day) => {
    if (day >= 1 && day <= 5) return 'Menstrual';
    if (day >= 6 && day <= 10) return 'Post-Menstrual';
    if (day >= 11 && day <= 17) return 'Ovulation Peak';
    if (day >= 18 && day <= 23) return 'Luteal Phase';
    return 'Pre-Menstrual';
  };

  const getMoodDescription = (mood, day) => {
    if (day >= 1 && day <= 5) return 'Cramps, Low Energy, Emotional';
    if (day >= 6 && day <= 10) return 'Recovery, Gradual Uplift';
    if (day >= 11 && day <= 17) return 'Happy, Energetic, Lusty';
    if (day >= 18 && day <= 23) return 'Stable, Content';
    return 'Irritable, Sad, Pre-Period Mood';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateCalendar = (direction) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(calendarDate.getMonth() + direction);
    setCalendarDate(newDate);
  };

  const getCalendarDayType = (date, calendarData) => {
    const dateStr = date.toISOString().split('T')[0];
    
    for (const cycle of calendarData.cycles) {
      const cycleStart = new Date(cycle.startDate);
      const cycleEnd = new Date(cycle.endDate);
      
      if (date >= cycleStart && date <= cycleEnd) {
        const dayInCycle = Math.floor((date - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
        
        if (dayInCycle >= 1 && dayInCycle <= 5) return { type: 'menstrual', day: dayInCycle };
        if (dayInCycle >= 11 && dayInCycle <= 17) return { type: 'ovulation', day: dayInCycle };
        if (dayInCycle >= 25 && dayInCycle <= 28) return { type: 'pms', day: dayInCycle };
        return { type: 'normal', day: dayInCycle };
      }
    }
    return { type: 'outside', day: 0 };
  };

  const getDayTypeColor = (type) => {
    switch (type) {
      case 'menstrual': return 'bg-red-500/30 text-red-300 border-red-400';
      case 'ovulation': return 'bg-green-500/30 text-green-300 border-green-400';
      case 'pms': return 'bg-yellow-500/30 text-yellow-300 border-yellow-400';
      case 'normal': return 'bg-blue-500/20 text-blue-300 border-blue-400';
      default: return 'bg-gray-700 text-gray-400 border-gray-600';
    }
  };

  const renderCalendar = () => {
    if (!results?.calendarData) return null;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayInfo = getCalendarDayType(date, results.calendarData);
      const isToday = date.toDateString() === new Date().toDateString();
      const isInputDate = date.toISOString().split('T')[0] === inputDate;
      
      calendarDays.push(
        <div
          key={day}
          className={`h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs cursor-pointer transition-all hover:scale-105 ${
            isInputDate ? 'ring-2 ring-purple-500 bg-purple-500/20' :
            isToday ? 'ring-2 ring-white bg-white/10' :
            getDayTypeColor(dayInfo.type)
          }`}
        >
          <span className="font-bold">{day}</span>
          {dayInfo.type !== 'outside' && (
            <span className="text-xs opacity-75">D{dayInfo.day}</span>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar(-1)}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <ChevronLeft size={16} />
          </Button>
          <h3 className="text-xl font-bold text-white">
            {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar(1)}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-medium">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500/30 border border-red-400 rounded"></div>
            <span className="text-gray-300">Menstrual (Days 1-5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500/30 border border-green-400 rounded"></div>
            <span className="text-gray-300">Ovulation (Days 11-17)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500/30 border border-yellow-400 rounded"></div>
            <span className="text-gray-300">PMS (Days 25-28)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-400 rounded"></div>
            <span className="text-gray-300">Normal Days</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <Heart className="inline-block mr-3 text-pink-400" size={40} />
            Women Mood Calculator
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            28-Day Arithmetic Progression Model - All Possible Cycle Scenarios
          </p>
          <p className="text-gray-500 text-sm font-medium">
            Created by Lakshya Sharma
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="mr-2 text-blue-400" size={24} />
              Enter Any Known Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="date-input" className="text-gray-300 mb-2 block">
                  Known Date (We'll calculate all 28 possible cycle scenarios)
                </Label>
                <Input
                  id="date-input"
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={calculateMood}
                disabled={!inputDate || loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-button"
              >
                {loading ? 'Calculating...' : 'Calculate All Scenarios'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
              <TabsTrigger value="scenarios" className="text-white data-[state=active]:bg-blue-600">
                All Scenarios
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-green-600">
                Smart Analysis
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-white data-[state=active]:bg-purple-600">
                Calendar View
              </TabsTrigger>
            </TabsList>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="mr-2 text-orange-400" size={24} />
                    Special Dates Analysis - Comparing All 28 Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                      <div className="flex items-center mb-2">
                        <Target className="mr-2 text-green-400" size={20} />
                        <h4 className="font-bold text-green-400">Ovulation Peak</h4>
                      </div>
                      <div className="space-y-2">
                        {results.analysis.ovulationDates.map((date, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-white font-medium">{formatDate(date.date)}</div>
                            <div className="text-green-300 text-xs">Mood: {date.mood.toFixed(1)} - Happy, Energetic, Lusty</div>
                            <div className="text-gray-400 text-xs">{date.scenarios} scenarios peak here</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="mr-2 text-red-400" size={20} />
                        <h4 className="font-bold text-red-400">Menstrual/Cramps</h4>
                      </div>
                      <div className="space-y-2">
                        {results.analysis.menstrualDates.map((date, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-white font-medium">{formatDate(date.date)}</div>
                            <div className="text-red-300 text-xs">Mood: {date.mood.toFixed(1)} - Cramps, Low Energy</div>
                            <div className="text-gray-400 text-xs">{date.scenarios} scenarios start here</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center mb-2">
                        <Heart className="mr-2 text-yellow-400" size={20} />
                        <h4 className="font-bold text-yellow-400">PMS Period</h4>
                      </div>
                      <div className="space-y-2">
                        {results.analysis.pmsDates.map((date, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-white font-medium">{formatDate(date.date)}</div>
                            <div className="text-yellow-300 text-xs">Mood: {date.mood.toFixed(1)} - Irritable, Sad</div>
                            <div className="text-gray-400 text-xs">{date.scenarios} scenarios end here</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="mr-2 text-blue-400" size={20} />
                        <h4 className="font-bold text-blue-400">Best Mood Days</h4>
                      </div>
                      <div className="space-y-2">
                        {results.analysis.bestMoodDates.map((date, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-white font-medium">{formatDate(date.date)}</div>
                            <div className="text-blue-300 text-xs">Mood: {date.mood.toFixed(1)} - Peak Performance</div>
                            <div className="text-gray-400 text-xs">Optimal energy & happiness</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-bold mb-2">Summary Analysis</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {results.analysis.summary}
                    </p>
                    <p className="text-gray-500 text-xs mt-3 font-medium">
                      Analysis created by Lakshya Sharma
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CalendarDays className="mr-2 text-purple-400" size={24} />
                    Cycle Calendar - Past & Future Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderCalendar()}
                  <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-white font-bold mb-2">Calendar Guide</h4>
                    <p className="text-gray-300 text-sm leading-relaxed mb-2">
                      Navigate through months to see predicted cycle patterns. Purple ring shows your input date.
                      Red areas indicate menstrual days, green shows ovulation peaks, and yellow marks PMS periods.
                    </p>
                    <p className="text-gray-500 text-xs font-medium">
                      Calendar system created by Lakshya Sharma
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scenarios Tab */}
            <TabsContent value="scenarios" className="space-y-6">
              {/* Scenario Overview */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="mr-2 text-purple-400" size={24} />
                    All Possible Scenarios for {formatDate(inputDate)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-14 gap-2 mb-4">
                    {results.scenarios.map((scenario, index) => (
                      <Button
                        key={index}
                        variant={selectedScenario === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedScenario(index)}
                        className={`text-xs px-2 py-1 ${
                          selectedScenario === index 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Day {scenario.dayInCycle}
                      </Button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Click any scenario to see what happens if {formatDate(inputDate)} is that specific day of the cycle
                  </p>
                </CardContent>
              </Card>

              {/* Selected Scenario Details */}
              {results.scenarios[selectedScenario] && (
                <div className="space-y-6">
                  {/* Scenario Info */}
                  <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-purple-400 mb-2">
                          Scenario: {formatDate(inputDate)} is Day {results.scenarios[selectedScenario].dayInCycle}
                        </h3>
                        <p className="text-white text-lg mb-2">
                          Cycle runs from {formatDate(results.scenarios[selectedScenario].cycleStart)} to {formatDate(results.scenarios[selectedScenario].cycleEnd)}
                        </p>
                        <p className="text-gray-300">
                          Mood on {formatDate(inputDate)}: <span className="text-purple-400 font-bold">{results.scenarios[selectedScenario].inputDateMood.toFixed(2)}</span>
                          <span className="ml-2">({getMoodLabel(results.scenarios[selectedScenario].inputDateMood, results.scenarios[selectedScenario].dayInCycle)})</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arithmetic Calculations */}
                  <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="mr-2 text-green-400" size={24} />
                        Arithmetic Progression Calculations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm text-gray-300 space-y-2">
                        {results.scenarios[selectedScenario].calculations.map((step, index) => (
                          <div key={index} className="border-l-2 border-blue-500/30 pl-3">
                            {step}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calendar View */}
                  <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CalendarDays className="mr-2 text-orange-400" size={24} />
                        28-Day Calendar with Moods
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                        {results.scenarios[selectedScenario].moodProgression.map((item, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                              item.day === results.scenarios[selectedScenario].dayInCycle
                                ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/40'
                                : getMoodColor(item.mood)
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-xs text-gray-400">Day {item.day}</span>
                                <div className="font-bold text-sm">{formatDate(item.date)}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.mood.toFixed(1)}
                              </Badge>
                            </div>
                            <div className="text-xs">
                              <div className="font-medium mb-1">{getMoodLabel(item.mood, item.day)}</div>
                              <div className="opacity-80">{getMoodDescription(item.mood, item.day)}</div>
                            </div>
                            {item.day === results.scenarios[selectedScenario].dayInCycle && (
                              <div className="mt-2 text-xs text-purple-400 font-bold">
                                ← Your Date
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Peak Days Analysis */}
                  <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold text-green-400">Peak Analysis for This Scenario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-green-300 font-medium">Highest Mood</p>
                            <p className="text-white text-lg">
                              Day {results.scenarios[selectedScenario].peakDay}: {results.scenarios[selectedScenario].peakMood.toFixed(2)}
                            </p>
                            <p className="text-gray-300 text-sm">
                              {formatDate(results.scenarios[selectedScenario].peakDate)} - {getMoodDescription(results.scenarios[selectedScenario].peakMood, results.scenarios[selectedScenario].peakDay)}
                            </p>
                          </div>
                          <div>
                            <p className="text-red-300 font-medium">Lowest Mood</p>
                            <p className="text-white text-lg">
                              Day 1 & 28: {results.scenarios[selectedScenario].lowMood.toFixed(2)}
                            </p>
                            <p className="text-gray-300 text-sm">
                              Menstrual & Pre-Menstrual phases
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Summary */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-white text-lg">
                      {results.scenarios[selectedScenario]?.summary}
                    </p>
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <p className="text-gray-400 text-sm flex items-center justify-center">
                        <AlertCircle className="mr-2" size={16} />
                        Disclaimer: This tool is for entertainment/awareness only — not medical advice.
                      </p>
                      <p className="text-gray-500 text-sm mt-2 font-medium">
                        Created by Lakshya Sharma
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MoodCalculator;
