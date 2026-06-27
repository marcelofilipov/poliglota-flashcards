export interface SRSCard {
  interval_days: number;
  repetitions: number;
  ease_factor: number;
}

export interface SRSResult {
  interval_days: number;
  repetitions: number;
  ease_factor: number;
  next_review_at: string;
}

export function calculateNextReview(card: SRSCard, rating: 0 | 1 | 2 | 3): SRSResult {
  let {interval_days, repetitions, ease_factor} = card;

  if (rating === 0) {
    repetitions = 0;
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  } else if (rating === 1) {
    interval_days = Math.max(1, interval_days * 0.5);
    ease_factor = Math.max(1.3, ease_factor - 0.15);
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 3;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }

    if (rating === 3) {
      ease_factor = Math.min(3.0, ease_factor + 0.1);
      interval_days = Math.round(interval_days * 1.3);
    }

    repetitions += 1;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + Math.round(interval_days));

  return {
    interval_days,
    repetitions,
    ease_factor,
    next_review_at: nextDate.toISOString(),
  };
}
