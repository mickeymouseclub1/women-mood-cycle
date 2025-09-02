export const mockMoodData = {
  calculateAllScenarios: (inputDate) => {
    // Mock calculation parameters
    const cycleLength = 28;
    const mood_min = 40.0;
    const mood_peak = 85.0;
    
    // Parse input date
    const givenDate = new Date(inputDate);
    
    // Calculate all 28 possible scenarios
    const scenarios = [];
    
    for (let dayInCycle = 1; dayInCycle <= 28; dayInCycle++) {
      // Calculate cycle start date for this scenario
      const cycleStartDate = new Date(givenDate);
      cycleStartDate.setDate(givenDate.getDate() - (dayInCycle - 1));
      
      // Calculate cycle end date
      const cycleEndDate = new Date(cycleStartDate);
      cycleEndDate.setDate(cycleStartDate.getDate() + (cycleLength - 1));
      
      // Calculate arithmetic progression step
      const step = (mood_peak - mood_min) / 13;
      
      // Build calculations array
      const calculations = [
        `Scenario: ${inputDate} is Day ${dayInCycle} of the cycle`,
        `Calculated Cycle Start: ${cycleStartDate.toISOString().split('T')[0]}`,
        `Calculated Cycle End: ${cycleEndDate.toISOString().split('T')[0]}`,
        `Cycle Length: ${cycleLength} days`,
        `Mood Range: ${mood_min} to ${mood_peak}`,
        `Step Calculation: (${mood_peak} - ${mood_min}) / 13 = ${step.toFixed(4)}`,
        ``,
        `Arithmetic Progression Formula:`,
        `Days 1-14 (ascending): mood = ${mood_min} + (day-1) × ${step.toFixed(4)}`,
        `Days 15-28 (descending): mood = ${mood_peak} - (day-15) × ${step.toFixed(4)}`,
        ``,
        `Individual Day Calculations:`,
      ];

      // Generate 28-day progression for this scenario
      const moodProgression = [];
      let peakMood = 0;
      let peakDay = 1;
      let peakDate = '';
      
      for (let day = 1; day <= cycleLength; day++) {
        let mood;
        if (day <= 14) {
          // Ascending phase
          mood = mood_min + (day - 1) * step;
        } else {
          // Descending phase
          mood = mood_peak - (day - 15) * step;
        }
        
        // Round to 2 decimal places
        mood = Math.round(mood * 100) / 100;
        
        // Calculate the actual date for this day
        const dayDate = new Date(cycleStartDate);
        dayDate.setDate(cycleStartDate.getDate() + (day - 1));
        
        moodProgression.push({
          day: day,
          mood: mood,
          date: dayDate.toISOString().split('T')[0]
        });
        
        if (mood > peakMood) {
          peakMood = mood;
          peakDay = day;
          peakDate = dayDate.toISOString().split('T')[0];
        }
        
        calculations.push(`Day ${day} (${dayDate.toISOString().split('T')[0]}): ${mood.toFixed(2)} ${day <= 14 ? '(ascending)' : '(descending)'}`);
      }

      // Get mood for the input date in this scenario
      const inputDateMood = moodProgression[dayInCycle - 1].mood;

      const getMoodLevel = (mood) => {
        if (mood >= 75) return "Excellent";
        if (mood >= 60) return "Good";
        if (mood >= 45) return "Average";
        return "Low";
      };

      const inputDateLabel = getMoodLevel(inputDateMood);
      const summary = `In this scenario: ${inputDate} (day ${dayInCycle} of cycle), mood = ${inputDateMood.toFixed(2)} → ${inputDateLabel} (Created by Lakshya Sharma)`;

      scenarios.push({
        dayInCycle,
        cycleStart: cycleStartDate.toISOString().split('T')[0],
        cycleEnd: cycleEndDate.toISOString().split('T')[0],
        inputDateMood,
        calculations,
        moodProgression,
        peakDay,
        peakMood,
        peakDate,
        lowMood: mood_min,
        summary
      });
    }

    return {
      inputDate,
      scenarios,
      totalScenarios: 28
    };
  },

  analyzeAllScenarios: (results) => {
    const { scenarios } = results;
    const allDates = new Map();
    
    // Collect all dates from all scenarios with their mood info
    scenarios.forEach(scenario => {
      scenario.moodProgression.forEach(day => {
        const dateKey = day.date;
        if (!allDates.has(dateKey)) {
          allDates.set(dateKey, []);
        }
        allDates.get(dateKey).push({
          mood: day.mood,
          day: day.day,
          scenario: scenario.dayInCycle
        });
      });
    });

    // Analyze special dates
    const specialDates = {
      ovulation: [],
      menstrual: [],
      pms: [],
      bestMood: []
    };

    // Find ovulation dates (days 11-17 with highest moods)
    allDates.forEach((moodData, date) => {
      const ovulationMoods = moodData.filter(d => d.day >= 11 && d.day <= 17);
      if (ovulationMoods.length > 0) {
        const avgMood = ovulationMoods.reduce((sum, d) => sum + d.mood, 0) / ovulationMoods.length;
        if (avgMood >= 75) {
          specialDates.ovulation.push({
            date,
            mood: avgMood,
            scenarios: ovulationMoods.length
          });
        }
      }
    });

    // Find menstrual dates (days 1-5 with lowest moods)
    allDates.forEach((moodData, date) => {
      const menstrualMoods = moodData.filter(d => d.day >= 1 && d.day <= 5);
      if (menstrualMoods.length > 0) {
        const avgMood = menstrualMoods.reduce((sum, d) => sum + d.mood, 0) / menstrualMoods.length;
        if (avgMood <= 50) {
          specialDates.menstrual.push({
            date,
            mood: avgMood,
            scenarios: menstrualMoods.length
          });
        }
      }
    });

    // Find PMS dates (days 25-28)
    allDates.forEach((moodData, date) => {
      const pmsMoods = moodData.filter(d => d.day >= 25 && d.day <= 28);
      if (pmsMoods.length > 0) {
        const avgMood = pmsMoods.reduce((sum, d) => sum + d.mood, 0) / pmsMoods.length;
        if (avgMood <= 55) {
          specialDates.pms.push({
            date,
            mood: avgMood,
            scenarios: pmsMoods.length
          });
        }
      }
    });

    // Find best mood dates
    allDates.forEach((moodData, date) => {
      const avgMood = moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length;
      if (avgMood >= 80) {
        specialDates.bestMood.push({
          date,
          mood: avgMood,
          scenarios: moodData.length
        });
      }
    });

    // Sort by mood (descending for best, ascending for worst)
    specialDates.ovulation.sort((a, b) => b.mood - a.mood);
    specialDates.bestMood.sort((a, b) => b.mood - a.mood);
    specialDates.menstrual.sort((a, b) => a.mood - b.mood);
    specialDates.pms.sort((a, b) => a.mood - b.mood);

    // Take top dates for each category
    const ovulationDates = specialDates.ovulation.slice(0, 3);
    const menstrualDates = specialDates.menstrual.slice(0, 3);
    const pmsDates = specialDates.pms.slice(0, 3);
    const bestMoodDates = specialDates.bestMood.slice(0, 3);

    // Generate summary
    const summary = `Based on analysis of all 28 possible scenarios, we found ${ovulationDates.length} peak ovulation periods, ${menstrualDates.length} menstrual phases, and ${pmsDates.length} PMS periods. The highest mood peaks occur around days 13-15 of cycles, with optimal energy and fertility. Lowest moods typically happen during menstrual days 1-3 and pre-menstrual days 26-28.`;

    return {
      ovulationDates,
      menstrualDates,
      pmsDates,
      bestMoodDates,
      summary,
      totalDatesAnalyzed: allDates.size
    };
  },

  generateCalendarData: (inputDate) => {
    const givenDate = new Date(inputDate);
    const cycles = [];
    
    // Generate 6 months of cycle data (3 past, current, 2 future)
    for (let i = -3; i <= 2; i++) {
      const cycleStart = new Date(givenDate);
      cycleStart.setDate(givenDate.getDate() + (i * 28));
      
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleStart.getDate() + 27);
      
      cycles.push({
        startDate: cycleStart.toISOString().split('T')[0],
        endDate: cycleEnd.toISOString().split('T')[0],
        cycleNumber: i + 4
      });
    }

    return {
      cycles,
      totalCycles: cycles.length,
      referenceDate: inputDate
    };
  }
};