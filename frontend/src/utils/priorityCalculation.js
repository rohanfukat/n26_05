// Priority calculation algorithm based on urgency, location impact, and complaint type
export const calculatePriority = (complaint) => {
  let score = 0;

  // Urgency factor (0-40 points)
  const urgencyScore = getUrgencyScore(complaint.category);
  score += urgencyScore;

  // Impact factor (0-40 points) - based on how many people affected
  const impactScore = getImpactScore(complaint);
  score += impactScore;

  // Time sensitivity (0-20 points)
  const timeScore = getTimeScore(complaint.createdAt);
  score += timeScore;

  // Convert score to priority level
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

// Urgency scores for different categories
const getUrgencyScore = (category) => {
  const urgencyMap = {
    water: 40, // Critical utility
    electricity: 38, // Critical utility
    police: 40, // Safety
    traffic: 35, // Safety impact
    roads: 25, // Infrastructure
    sanitation: 20, // Health
  };
  return urgencyMap[category] || 15;
};

// Impact score based on keywords and description length
const getImpactScore = (complaint) => {
  const description = complaint.description.toLowerCase();
  let score = 0;

  // Keywords indicating wider impact
  const impactKeywords = ['families', 'people', 'residents', 'community', 'area', 'zone', 'sector', 'block'];
  const matchCount = impactKeywords.filter(word => description.includes(word)).length;
  score += Math.min(matchCount * 5, 20);

  // Number mentions (affects how many)
  const numberMatch = description.match(/\d+/);
  if (numberMatch) {
    const number = parseInt(numberMatch[0]);
    if (number > 100) score += 20;
    else if (number > 50) score += 15;
    else if (number > 10) score += 10;
    else score += 5;
  }

  // Severity keywords
  const severityKeywords = ['urgent', 'emergency', 'critical', 'danger', 'safety', 'health'];
  if (severityKeywords.some(word => description.includes(word))) {
    score += 15;
  }

  return Math.min(score, 40);
};

// Time-based urgency score
const getTimeScore = (createdAt) => {
  const now = new Date();
  const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

  if (ageInDays > 7) return 20; // Older complaints are more urgent
  if (ageInDays > 3) return 15;
  if (ageInDays > 1) return 10;
  return 5;
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    critical: '#dc2626', // red
    high: '#ea580c', // orange
    medium: '#eab308', // yellow
    low: '#22c55e', // green
  };
  return colors[priority] || '#6b7280';
};

// Get priority badge
export const getPriorityBadge = (priority) => {
  const badges = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  return badges[priority] || '⚪';
};

// Calculate estimated resolution time based on priority and category
export const getEstimatedResolutionTime = (priority, category) => {
  const baseResolutionTimes = {
    critical: 1, // 1 day
    high: 3, // 3 days
    medium: 7, // 7 days
    low: 14, // 14 days
  };

  const categoryMultiplier = {
    water: 1,
    electricity: 1,
    police: 0.5,
    traffic: 1.5,
    roads: 2,
    sanitation: 2.5,
  };

  const baseDays = baseResolutionTimes[priority] || 7;
  const multiplier = categoryMultiplier[category] || 1;
  const totalDays = Math.ceil(baseDays * multiplier);

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + totalDays);

  return deadline;
};

// Sort complaints by priority
export const sortByPriority = (complaints) => {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...complaints].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};
