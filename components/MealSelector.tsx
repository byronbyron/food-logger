'use client';

import { MEALS, MEAL_LABELS, Meal } from '@/types';

interface Props {
  selected: Meal | null;
  onChange: (meal: Meal | null) => void;
}

export function MealSelector({ selected, onChange }: Props) {
  return (
    <div className="meal-selector">
      {MEALS.map((meal) => (
        <button
          key={meal}
          type="button"
          className={`meal-opt ${selected === meal ? `sel-${meal}` : ''}`}
          onClick={() => onChange(selected === meal ? null : meal)}
        >
          {MEAL_LABELS[meal]}
        </button>
      ))}
    </div>
  );
}
