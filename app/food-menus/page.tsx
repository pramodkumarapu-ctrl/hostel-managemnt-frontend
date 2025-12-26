'use client';

import { useEffect, useState } from 'react';
import { Coffee, Sun, Moon, Edit2, Save, X } from 'lucide-react';

/* ================= DAYS (UI) ================= */

const DAYS = [
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' },
];

const MEALS = [
  { label: 'Breakfast', value: 'BREAKFAST', icon: Coffee },
  { label: 'Lunch', value: 'LUNCH', icon: Sun },
  { label: 'Dinner', value: 'DINNER', icon: Moon },
];

const MEAL_GRADIENTS: Record<string, string> = {
  BREAKFAST: 'from-sky-500 to-blue-600',
  LUNCH: 'from-amber-400 to-orange-500',
  DINNER: 'from-pink-500 to-rose-600',
};

/* ================= UTILS ================= */

// 🔥 CONVERT UI DAY → BACKEND ENUM
const toDayType = (day: string) =>
  ['SATURDAY', 'SUNDAY'].includes(day)
    ? 'WEEKEND'
    : 'WEEKDAY';

/* ================= PAGE ================= */

export default function FoodMenuPage() {
  const hostelId = '69da57b4-33ac-4429-8b48-dacdf102eae1'; // ✅ REAL ID

  const [menus, setMenus] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [editing, setEditing] = useState<string | null>(null);

  const [form, setForm] = useState({
    items: '',
    startTime: '08:00',
    endTime: '09:00',
  });

  /* ================= FETCH ================= */

  const loadMenus = async () => {
    const res = await fetch(
      `http://localhost:3000/food-menus?hostelId=${hostelId}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    setMenus(Array.isArray(data) ? data : data?.data || []);
  };

  useEffect(() => {
    loadMenus();
  }, []);

  /* ================= HELPERS ================= */

  const findMenu = (mealType: string) =>
    menus.find(
      m =>
        m.dayType === toDayType(selectedDay) &&
        m.mealType === mealType
    );

  const startEdit = (mealType: string, existing: any) => {
    setForm({
      items: existing?.items || '',
      startTime: existing?.startTime || '08:00',
      endTime: existing?.endTime || '09:00',
    });
    setEditing(mealType);
  };

  const saveMenu = async (mealType: string) => {
    await fetch('http://localhost:3000/food-menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostelId,
        dayType: toDayType(selectedDay), // ✅ FIX
        mealType,
        ...form,
      }),
    });

    setEditing(null);
    loadMenus();
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-gray-800">
          Weekly Food Menu
        </h1>

      <div className="relative w-full md:w-72">
  <select
    value={selectedDay}
    onChange={e => {
      setSelectedDay(e.target.value);
      setEditing(null);
    }}
    className="
      w-full appearance-none
      bg-white
      border-2 border-indigo-500
      text-gray-900
      font-bold
      px-5 py-3
      rounded-xl
      shadow-lg
      cursor-pointer
      focus:outline-none
      focus:ring-4 focus:ring-indigo-300
      hover:bg-indigo-50
      transition
    "
  >
    {DAYS.map(day => (
      <option
        key={day.value}
        value={day.value}
        className="font-semibold text-gray-900"
      >
        {day.label}
      </option>
    ))}
  </select>

  {/* Dropdown Arrow */}
  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-indigo-600">
    ▼
  </div>
</div>

      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {MEALS.map(meal => {
          const current = findMenu(meal.value);
          const isEditing = editing === meal.value;
          const Icon = meal.icon;

          return (
            <div
              key={meal.value}
              className={`bg-gradient-to-r ${MEAL_GRADIENTS[meal.value]} rounded-2xl p-6 text-white`}
            >
              <div className="flex justify-between">
                <div className="flex gap-2 items-center">
                  <Icon size={18} />
                  <span>{meal.label}</span>
                </div>
              </div>

              <div className="mt-4">
                {isEditing ? (
                  <>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={e =>
                        setForm({ ...form, startTime: e.target.value })
                      }
                      className="w-full mb-2 p-2 rounded bg-white/20"
                    />
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={e =>
                        setForm({ ...form, endTime: e.target.value })
                      }
                      className="w-full mb-2 p-2 rounded bg-white/20"
                    />
                    <textarea
                      value={form.items}
                      onChange={e =>
                        setForm({ ...form, items: e.target.value })
                      }
                      className="w-full p-2 rounded bg-white/20"
                    />
                  </>
                ) : (
                  <p className="text-lg font-semibold">
                    {current?.items || 'Not added'}
                  </p>
                )}
              </div>

              {isEditing ? (
                <button
                  onClick={() => saveMenu(meal.value)}
                  className="mt-4 w-full bg-white text-black py-2 rounded-xl font-bold"
                >
                  <Save size={14} className="inline mr-1" /> Save
                </button>
              ) : (
                <button
                  onClick={() => startEdit(meal.value, current)}
                  className="mt-4 w-full bg-white/20 py-2 rounded-xl font-bold"
                >
                  <Edit2 size={14} className="inline mr-1" />
                  Add / Edit
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
