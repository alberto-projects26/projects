export function calculateMissionBudget(mission: any) {
  // Budget forecasting logic:
  // 1. Base cost by mission importance (priority)
  // 2. Linear scaling per sub-task complexity
  
  const priorityMultipliers = {
    low: 50,      // $50 base
    medium: 150,  // $150 base
    high: 500,    // $500 base
    critical: 1500 // $1500 base
  };

  const perTaskCost = 50; // Average cost per task in tokens/retries
  
  const base = priorityMultipliers[mission.priority as keyof typeof priorityMultipliers] || 150;
  const tasks = (mission.subTasks?.length || 0) * perTaskCost;
  
  // Forecast based on mission duration (days)
  const durationDays = mission.targetDate && mission.startDate 
    ? (new Date(mission.targetDate).getTime() - new Date(mission.startDate).getTime()) / (1000 * 60 * 60 * 24)
    : 14;
  
  const dailyOverhead = durationDays * 5; // $5 daily for context maintenance/updates

  return Math.round(base + tasks + dailyOverhead);
}

export async function getOpenRouterCost(missionId: string) {
  // Integration with OpenRouter stats:
  // Querying usage data tagged with mission_id
  try {
    const response = await fetch(`/api/openrouter/usage?tag=${missionId}`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.total_cost || 0;
  } catch (e) {
    return 0; // Fallback to 0 if API is unavailable
  }
}
