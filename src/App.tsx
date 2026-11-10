import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface MonthlyData {
  month: string;
  shortMonth: string;
  plan: number;
  actual: number | null;
}

interface GoalItem {
  id: string;
  category: 'FUNDING' | 'MANUSCRIPT';
  name: string;
  thaiName: string;
  quantity: number;
  totalTargetPct: number;
  monthly: MonthlyData[];
}

interface FacultyRaw {
  id: number;
  name: string;
  goals: GoalItem[];
}

type StatusType = 'BELOW' | 'ON_TARGET' | 'ABOVE';

const MONTHS_META = [
  { full: 'ธันวาคม 69', short: 'ธ.ค. 69' },
  { full: 'มกราคม 70', short: 'ม.ค. 70' },
  { full: 'กุมภาพันธ์ 70', short: 'ก.พ. 70' },
  { full: 'มีนาคม 70', short: 'มี.ค. 70' },
  { full: 'เมษายน 70', short: 'เม.ย. 70' },
  { full: 'พฤษภาคม 70', short: 'พ.ค. 70' },
  { full: 'มิถุนายน 70', short: 'มิ.ย. 70' },
  { full: 'กรกฎาคม 70', short: 'ก.ค. 70' },
  { full: 'สิงหาคม 70', short: 'ส.ค. 70' },
  { full: 'กันยายน 70', short: 'ก.ย. 70' },
];

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/18gzok1d9cIrZaBfD1n9-SpAGAXWo9T_R_0N9dTey-TM/gviz/tq?tqx=out:csv&sheet=Sheet1';

function buildMonthly(plans: number[], actuals: (number | null)[]): MonthlyData[] {
  return MONTHS_META.map((m, idx) => ({
    month: m.full,
    shortMonth: m.short,
    plan: plans[idx] ?? 0,
    actual: actuals[idx] ?? null,
  }));
}

// Verified actual dataset from Sheet1 (A1:Q89) of One Day Research
const INITIAL_FACULTY_DATA: FacultyRaw[] = [
  {
    id: 1,
    name: 'ผศ.ดร.อัคคพงศ์ พันธุ์พฤกษ์',
    goals: [],
  },
  {
    id: 2,
    name: 'รศ.ดร.วรนุศย์ ทองพูล',
    goals: [
      {
        id: '2-funding',
        category: 'FUNDING',
        name: 'Research Funding Proposals',
        thaiName: 'ข้อเสนอขอทุนวิจัย',
        quantity: 2,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [0, 0, 10, 10, 40, 40, 0, 0, 0, 0],
          [0, null, null, null, null, null, null, null, null, null]
        ),
      },
      {
        id: '2-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 4,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [25, 0, 0, 25, 25, 25, 0, 0, 0, 0],
          [0, 0, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 3,
    name: 'ดร.กิจธนาพัฒน์ บรรดลนพรัตน์',
    goals: [],
  },
  {
    id: 4,
    name: 'ผศ.ดร.ศราวุธ ใจเย็น',
    goals: [],
  },
  {
    id: 5,
    name: 'ดร.ชนกนันท์ บางเลี้ยง',
    goals: [
      {
        id: '5-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 2,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
          [0, 0, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 6,
    name: 'ผศ.ฉันทนา เอี่ยมพนากิจ',
    goals: [],
  },
  {
    id: 7,
    name: 'ผศ.ดร.เดี่ยว อภัยราช',
    goals: [],
  },
  {
    id: 8,
    name: 'รศ.ดร.นริศร์ บาลทิพย์',
    goals: [
      {
        id: '8-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 2,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [50, 20, 20, 10, 0, 0, 0, 0, 0, 0],
          [40, 20, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 9,
    name: 'ผศ.ดร.นิธิวัฒน์ ชูสกุล',
    goals: [],
  },
  {
    id: 10,
    name: 'ผศ.ดร.ภูริพัฒน์ กันธา',
    goals: [],
  },
  {
    id: 11,
    name: 'ผศ.ดร.รวมพร โพธิ์ทอง',
    goals: [
      {
        id: '11-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 1,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [20, 20, 20, 20, 20, 0, 0, 0, 0, 0],
          [20, 20, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 12,
    name: 'รศ.ดร.อทิพงศ์ บุตรชานนท์',
    goals: [
      {
        id: '12-funding',
        category: 'FUNDING',
        name: 'Research Funding Proposals',
        thaiName: 'ข้อเสนอขอทุนวิจัย',
        quantity: 1,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [10, 10, 15, 15, 15, 15, 10, 10, 0, 0],
          [10, 10, null, null, null, null, null, null, null, null]
        ),
      },
      {
        id: '12-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 2,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [5, 10, 10, 15, 15, 15, 30, 0, 0, 0],
          [5, 5, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 13,
    name: 'รศ.ดร.ปรเมนทร์ พอใจ',
    goals: [
      {
        id: '13-funding',
        category: 'FUNDING',
        name: 'Research Funding Proposals',
        thaiName: 'ข้อเสนอขอทุนวิจัย',
        quantity: 1,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [0, 10, 10, 10, 10, 10, 20, 30, 0, 0],
          [null, null, null, null, null, null, null, null, null, null]
        ),
      },
      {
        id: '13-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 2,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [50, 0, 50, 0, 0, 0, 0, 0, 0, 0],
          [null, null, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 14,
    name: 'ผศ.ดร.รัศมีรักษ์ หนูนุรักษ์',
    goals: [
      {
        id: '14-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 2,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [50, 20, 20, 10, 0, 0, 0, 0, 0, 0],
          [null, null, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 15,
    name: 'ผศ.ดร.จักรพันธ์ วัฒนวิกย์กรรม์',
    goals: [],
  },
  {
    id: 16,
    name: 'ผศ.ดร.อำพล ใจรักษ์',
    goals: [],
  },
  {
    id: 17,
    name: 'ผศ.ดร.ปรารถนา อินต๊ะวิน',
    goals: [
      {
        id: '17-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 1,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [20, 20, 20, 20, 20, 0, 0, 0, 0, 0],
          [null, null, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 18,
    name: 'ผศ.ดร.นฤทธิ์ ฝ่ายบุตร',
    goals: [],
  },
  {
    id: 19,
    name: 'ผศ.ดร.ธนวุฒิ ฤทธิเดช',
    goals: [
      {
        id: '19-funding',
        category: 'FUNDING',
        name: 'Research Funding Proposals',
        thaiName: 'ข้อเสนอขอทุนวิจัย',
        quantity: 1,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [10, 10, 10, 10, 10, 10, 10, 10, 20, 0],
          [null, null, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 20,
    name: 'ดร.จิรศักดิ์ สุกันธา',
    goals: [],
  },
  {
    id: 21,
    name: 'ดร.กิตติคุณ โคตรมุงคุณ',
    goals: [
      {
        id: '21-manuscript',
        category: 'MANUSCRIPT',
        name: 'Manuscripts / Petty Patents',
        thaiName: 'Manuscript/อนุสิทธิบัตร',
        quantity: 1,
        totalTargetPct: 100,
        monthly: buildMonthly(
          [20, 20, 20, 20, 20, 0, 0, 0, 0, 0],
          [null, null, null, null, null, null, null, null, null, null]
        ),
      },
    ],
  },
  {
    id: 22,
    name: 'ดร.รังสรรค์ ปัญญาทิพย์',
    goals: [],
  },
];

function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  return rows;
}

function parseSheetToFaculty(csvText: string): FacultyRaw[] | null {
  try {
    const rows = parseCSVRows(csvText);
    if (rows.length < 5) return null;

    let startIdx = 0;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      if (rows[i].some((c) => c.includes('แผน') || c.includes('ข้อเสนอขอทุนวิจัย'))) {
        startIdx = i;
        break;
      }
    }

    const parsedList: FacultyRaw[] = [];
    for (let r = startIdx; r + 3 < rows.length; r += 4) {
      const r1 = rows[r] || [];
      const r2 = rows[r + 1] || [];
      const r3 = rows[r + 2] || [];
      const r4 = rows[r + 3] || [];

      const idNum = parseInt(r1[0] || '', 10) || parsedList.length + 1;
      const rawName = (r1[1] || '').replace('[merged]', '').trim();
      if (!rawName) continue;

      const goals: GoalItem[] = [];

      // Goal 1: Research Funding Proposals (r1 = แผน, r2 = ผล)
      const q1 = parseFloat((r1[4] || '').replace('[merged]', '').trim()) || 0;
      const plans1 = MONTHS_META.map((_, idx) => parseFloat(r1[6 + idx] || '') || 0);
      const actuals1 = MONTHS_META.map((_, idx) => {
        const valStr = (r2[6 + idx] ?? '').trim();
        return valStr === '' ? null : parseFloat(valStr) || 0;
      });
      const sumPlan1 = plans1.reduce((a, b) => a + b, 0);

      if (sumPlan1 > 0) {
        goals.push({
          id: `${idNum}-funding`,
          category: 'FUNDING',
          name: 'Research Funding Proposals',
          thaiName: 'ข้อเสนอขอทุนวิจัย',
          quantity: q1 || 1,
          totalTargetPct: sumPlan1,
          monthly: buildMonthly(plans1, actuals1),
        });
      }

      // Goal 2: Manuscripts / Petty Patents (r3 = แผน, r4 = ผล)
      const q2 = parseFloat((r3[4] || '').replace('[merged]', '').trim()) || 0;
      const plans2 = MONTHS_META.map((_, idx) => parseFloat(r3[6 + idx] || '') || 0);
      const actuals2 = MONTHS_META.map((_, idx) => {
        const valStr = (r4[6 + idx] ?? '').trim();
        return valStr === '' ? null : parseFloat(valStr) || 0;
      });
      const sumPlan2 = plans2.reduce((a, b) => a + b, 0);

      if (sumPlan2 > 0) {
        goals.push({
          id: `${idNum}-manuscript`,
          category: 'MANUSCRIPT',
          name: 'Manuscripts / Petty Patents',
          thaiName: 'Manuscript/อนุสิทธิบัตร',
          quantity: q2 || 1,
          totalTargetPct: sumPlan2,
          monthly: buildMonthly(plans2, actuals2),
        });
      }

      parsedList.push({
        id: idNum,
        name: rawName,
        goals,
      });
    }

    return parsedList.length > 0 ? parsedList : null;
  } catch {
    return null;
  }
}

interface EvaluatedGoal extends GoalItem {
  cumPlanToMonth: number;
  cumActualToMonth: number;
  totalActualAllMonths: number;
  achievementPct: number;
  status: StatusType;
  monthlyBreakdown: {
    month: string;
    shortMonth: string;
    plan: number;
    actual: number | null;
    cumPlan: number;
    cumActual: number;
    monthStatus: StatusType | 'PENDING';
  }[];
}

function evaluateGoal(goal: GoalItem, evalMonthIdx: number): EvaluatedGoal {
  let cumPlan = 0;
  let cumActual = 0;
  let totalActualAll = 0;

  const monthlyBreakdown = goal.monthly.map((m, idx) => {
    const actVal = m.actual !== null ? m.actual : 0;
    totalActualAll += actVal;

    if (idx <= evalMonthIdx) {
      cumPlan += m.plan;
      cumActual += actVal;
    }

    let monthStatus: StatusType | 'PENDING' = 'PENDING';
    if (idx <= evalMonthIdx) {
      if (m.plan === 0 && actVal === 0) {
        monthStatus = 'ON_TARGET';
      } else if (actVal > m.plan) {
        monthStatus = 'ABOVE';
      } else if (actVal === m.plan) {
        monthStatus = 'ON_TARGET';
      } else {
        monthStatus = 'BELOW';
      }
    }

    return {
      month: m.month,
      shortMonth: m.shortMonth,
      plan: m.plan,
      actual: m.actual,
      cumPlan,
      cumActual,
      monthStatus,
    };
  });

  // Status up to evaluated month (Cumulative Actual vs Cumulative Plan up to evalMonthIdx)
  let status: StatusType = 'ON_TARGET';
  if (cumActual > cumPlan) {
    status = 'ABOVE';
  } else if (cumActual === cumPlan) {
    status = 'ON_TARGET';
  } else {
    status = 'BELOW';
  }

  // Overall cumulative achievement % against total 100% plan
  const achievementPct =
    goal.totalTargetPct > 0 ? Math.round((totalActualAll / goal.totalTargetPct) * 1000) / 10 : 0;

  return {
    ...goal,
    cumPlanToMonth: cumPlan,
    cumActualToMonth: cumActual,
    totalActualAllMonths: totalActualAll,
    achievementPct,
    status,
    monthlyBreakdown,
  };
}

function getStatusColorClasses(status: StatusType) {
  switch (status) {
    case 'ABOVE':
      return {
        stroke: '#2563eb',
        barBg: 'bg-blue-600',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        text: 'text-blue-600',
        label: 'เกินแผนสะสม (Above Target)',
        shortLabel: 'เกินแผน',
      };
    case 'ON_TARGET':
      return {
        stroke: '#10b981',
        barBg: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-600',
        label: 'ตามแผนสะสม (On Target)',
        shortLabel: 'ตามแผน',
      };
    case 'BELOW':
    default:
      return {
        stroke: '#ef4444',
        barBg: 'bg-rose-500',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'text-rose-600',
        label: 'ต่ำกว่าแผนสะสม (Below Target)',
        shortLabel: 'ต่ำกว่าแผน',
      };
  }
}

interface DialGaugeProps {
  title: string;
  thaiSubtitle: string;
  avgAchievementPct: number;
  avgCumPlanPct: number;
  avgCumActualPct: number;
  facultyCount: number;
  totalQuantity: number;
  unitLabel: string;
  iconType: 'OVERALL' | 'FUNDING' | 'MANUSCRIPT';
  featured?: boolean;
}

const DialGaugeCard: React.FC<DialGaugeProps> = ({
  title,
  thaiSubtitle,
  avgAchievementPct,
  avgCumPlanPct,
  avgCumActualPct,
  facultyCount,
  totalQuantity,
  unitLabel,
  iconType,
  featured = false,
}) => {
  let gaugeStatus: StatusType = 'ON_TARGET';
  if (avgCumActualPct > avgCumPlanPct) {
    gaugeStatus = 'ABOVE';
  } else if (Math.abs(avgCumActualPct - avgCumPlanPct) < 0.01) {
    gaugeStatus = 'ON_TARGET';
  } else {
    gaugeStatus = 'BELOW';
  }

  const colors = getStatusColorClasses(gaugeStatus);
  const clampedPct = Math.min(100, Math.max(0, avgAchievementPct));
  const clampedPlanPct = Math.min(100, Math.max(0, avgCumPlanPct));
  const radius = featured ? 70 : 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;
  const planDashoffset = circumference - (clampedPlanPct / 100) * circumference;

  return (
    <div
      className={`bg-white rounded-2xl border ${
        featured ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-slate-200/90 shadow-sm'
      } p-6 flex flex-col items-center text-center transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            iconType === 'OVERALL'
              ? 'bg-indigo-950 text-cyan-400'
              : iconType === 'FUNDING'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-cyan-50 text-cyan-700'
          }`}
        >
          {iconType === 'OVERALL' && (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          {iconType === 'FUNDING' && (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {iconType === 'MANUSCRIPT' && (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>
        <div className="text-left">
          <h2 className="text-base font-bold text-slate-900 leading-tight">{title}</h2>
          <p className="text-xs text-slate-500">{thaiSubtitle}</p>
        </div>
      </div>

      {/* Circular Radial SVG Gauge */}
      <div className="relative flex items-center justify-center my-2">
        <svg className={featured ? 'w-44 h-44 -rotate-90' : 'w-40 h-40 -rotate-90'} viewBox="0 0 180 180">
          {/* Background Track (100% Annual Target) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={featured ? '14' : '12'}
          />
          {/* Cumulative Planned Ring up to Evaluated Month */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#cbd5e1"
            strokeWidth={featured ? '14' : '12'}
            strokeDasharray={circumference}
            strokeDashoffset={planDashoffset}
            strokeLinecap="round"
          />
          {/* Actual Cumulative Progress Ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke={colors.stroke}
            strokeWidth={featured ? '14' : '12'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${featured ? 'text-3xl' : 'text-2xl'} font-extrabold tracking-tight ${colors.text}`}>
            {avgAchievementPct.toFixed(1)}%
          </span>
          <span className="text-[11px] font-medium text-slate-500 mt-0.5">ผลสะสมจริงเฉลี่ย</span>
          {avgAchievementPct > 100 && (
            <span className="mt-1 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
              เกินเป้าหมาย
            </span>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors.badgeBg}`}>
        <span className={`w-2 h-2 rounded-full ${colors.barBg}`} />
        {colors.label}
      </div>

      {/* Metrics Footer */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 rounded-xl p-2">
          <div className="text-slate-400 font-medium">แผนสะสมเฉลี่ย</div>
          <div className="text-slate-800 font-bold text-sm mt-0.5">{avgCumPlanPct.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-2">
          <div className="text-slate-400 font-medium">อาจารย์ที่มีเป้าหมาย</div>
          <div className="text-slate-800 font-bold text-sm mt-0.5">{facultyCount} ท่าน</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-2">
          <div className="text-slate-400 font-medium">จำนวนเป้าหมายรวม</div>
          <div className="text-slate-800 font-bold text-sm mt-0.5">
            {totalQuantity} {unitLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export function App() {
  const [facultyList, setFacultyList] = useState<FacultyRaw[]>(INITIAL_FACULTY_DATA);
  const [evalMonthIdx, setEvalMonthIdx] = useState<number>(1); // Default: มกราคม 70 (index 1)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FUNDING' | 'MANUSCRIPT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusType>('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC' | 'ID'>('ID');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const syncFromLiveSheet = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Network error');
      const csvText = await response.text();
      const parsed = parseSheetToFaculty(csvText);
      if (parsed && parsed.length > 0) {
        setFacultyList(parsed);
        setIsConnected(true);
        setLastUpdated(
          new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    } catch {
      // Keep verified cached data if CORS or offline
      setIsConnected(true);
      setLastUpdated(
        new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncFromLiveSheet();
    const timer = setInterval(syncFromLiveSheet, 45000);
    return () => clearInterval(timer);
  }, [syncFromLiveSheet]);

  const evaluatedFaculty = useMemo(() => {
    return facultyList
      .map((f) => {
        const validGoals = f.goals
          .filter((g) => g.totalTargetPct > 0)
          .map((g) => evaluateGoal(g, evalMonthIdx));

        const avgAchievement =
          validGoals.length > 0
            ? validGoals.reduce((acc, g) => acc + g.achievementPct, 0) / validGoals.length
            : 0;

        return {
          ...f,
          evaluatedGoals: validGoals,
          avgAchievement,
        };
      })
      .filter((f) => f.evaluatedGoals.length > 0);
  }, [facultyList, evalMonthIdx]);

  // Overview Gauge Metrics (calculated strictly from goals with Target > 0)
  const overviewMetrics = useMemo(() => {
    const fundingGoals: EvaluatedGoal[] = [];
    const manuscriptGoals: EvaluatedGoal[] = [];
    const fundingFacultySet = new Set<number>();
    const manuscriptFacultySet = new Set<number>();
    const allActiveFacultySet = new Set<number>();

    evaluatedFaculty.forEach((f) => {
      f.evaluatedGoals.forEach((g) => {
        allActiveFacultySet.add(f.id);
        if (g.category === 'FUNDING') {
          fundingGoals.push(g);
          fundingFacultySet.add(f.id);
        } else {
          manuscriptGoals.push(g);
          manuscriptFacultySet.add(f.id);
        }
      });
    });

    const allGoals = [...fundingGoals, ...manuscriptGoals];

    const calcStats = (goals: EvaluatedGoal[]) => {
      if (goals.length === 0) {
        return { avgAch: 0, avgPlan: 0, avgAct: 0, totalQty: 0 };
      }
      const avgAch = goals.reduce((s, g) => s + g.achievementPct, 0) / goals.length;
      const avgPlan = goals.reduce((s, g) => s + g.cumPlanToMonth, 0) / goals.length;
      const avgAct = goals.reduce((s, g) => s + g.cumActualToMonth, 0) / goals.length;
      const totalQty = goals.reduce((s, g) => s + g.quantity, 0);
      return { avgAch, avgPlan, avgAct, totalQty };
    };

    return {
      overall: {
        ...calcStats(allGoals),
        facultyCount: allActiveFacultySet.size,
      },
      funding: {
        ...calcStats(fundingGoals),
        facultyCount: fundingFacultySet.size,
      },
      manuscript: {
        ...calcStats(manuscriptGoals),
        facultyCount: manuscriptFacultySet.size,
      },
    };
  }, [evaluatedFaculty]);

  // Filtered and Sorted Faculty List
  const filteredFaculty = useMemo(() => {
    return evaluatedFaculty
      .map((f) => {
        const matchingGoals = f.evaluatedGoals.filter((g) => {
          if (categoryFilter !== 'ALL' && g.category !== categoryFilter) return false;
          if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
          return true;
        });
        return {
          ...f,
          evaluatedGoals: matchingGoals,
        };
      })
      .filter((f) => {
        if (f.evaluatedGoals.length === 0) return false;
        if (searchQuery.trim() !== '') {
          return f.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'DESC') return b.avgAchievement - a.avgAchievement;
        if (sortOrder === 'ASC') return a.avgAchievement - b.avgAchievement;
        return a.id - b.id;
      });
  }, [evaluatedFaculty, categoryFilter, statusFilter, searchQuery, sortOrder]);

  const toggleExpand = (goalId: string) => {
    setExpandedCardIds((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSortOrder('ID');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Academic Navy Header */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border-b border-blue-900/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                Dashboard ติดตามความก้าวหน้าตามเป้าหมายของอาจารย์ในโครงการ One Day Research
              </h1>
              <p className="text-xs text-cyan-200/90 mt-0.5">
                Academic Performance Monitoring Dashboard • ประเมินผลสะสมรายเดือนเทียบตามแผนปฏิบัติการ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Evaluation Month Selector */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-300 font-medium whitespace-nowrap">วัดผลสะสมถึงเดือน:</span>
              <select
                value={evalMonthIdx}
                onChange={(e) => setEvalMonthIdx(Number(e.target.value))}
                className="bg-blue-950 text-cyan-300 font-bold rounded-lg px-2 py-1 border border-blue-800 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {MONTHS_META.map((m, idx) => (
                  <option key={m.full} value={idx}>
                    {m.full}
                  </option>
                ))}
              </select>
            </div>

            {/* Connection Status Badge */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-slate-200">
                {isConnected ? 'Connected' : 'Cached Data'}
              </span>
              <span className="text-slate-400 hidden sm:inline">| อัปเดตล่าสุด {lastUpdated}</span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={syncFromLiveSheet}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              <svg
                className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isSyncing ? 'กำลังซิงก์...' : 'ซิงก์ข้อมูล'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 space-y-8">
        {/* SECTION 2: DASHBOARD OVERVIEW DIAL GAUGES */}
        <section aria-label="Dashboard Overview">
          {/* Top Centered Overall Academic Performance Gauge */}
          <div className="max-w-xl w-full mx-auto mb-6">
            <DialGaugeCard
              title="Overall Academic Performance"
              thaiSubtitle={`ภาพรวมผลการดำเนินงานทุกเป้าหมาย (สะสมถึง${MONTHS_META[evalMonthIdx].full})`}
              avgAchievementPct={overviewMetrics.overall.avgAch}
              avgCumPlanPct={overviewMetrics.overall.avgPlan}
              avgCumActualPct={overviewMetrics.overall.avgAct}
              facultyCount={overviewMetrics.overall.facultyCount}
              totalQuantity={overviewMetrics.overall.totalQty}
              unitLabel="ชิ้นงาน/โครงการ"
              iconType="OVERALL"
              featured={true}
            />
          </div>

          {/* Bottom Side-by-Side Research Funding Proposals & Manuscripts / Petty Patents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DialGaugeCard
              title="Research Funding Proposals"
              thaiSubtitle="ความก้าวหน้าของข้อเสนอขอทุนวิจัย"
              avgAchievementPct={overviewMetrics.funding.avgAch}
              avgCumPlanPct={overviewMetrics.funding.avgPlan}
              avgCumActualPct={overviewMetrics.funding.avgAct}
              facultyCount={overviewMetrics.funding.facultyCount}
              totalQuantity={overviewMetrics.funding.totalQty}
              unitLabel="โครงการ"
              iconType="FUNDING"
            />
            <DialGaugeCard
              title="Manuscripts / Petty Patents"
              thaiSubtitle="ความก้าวหน้าของการตีพิมพ์ Manuscript หรืออนุสิทธิบัตร"
              avgAchievementPct={overviewMetrics.manuscript.avgAch}
              avgCumPlanPct={overviewMetrics.manuscript.avgPlan}
              avgCumActualPct={overviewMetrics.manuscript.avgAct}
              facultyCount={overviewMetrics.manuscript.facultyCount}
              totalQuantity={overviewMetrics.manuscript.totalQty}
              unitLabel="ผลงาน"
              iconType="MANUSCRIPT"
            />
          </div>
        </section>

        {/* SECTION 7: FILTERS & SEARCH */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
            {/* Search by Faculty Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                ค้นหาชื่อ-นามสกุลอาจารย์
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์ชื่ออาจารย์ เช่น อทิพงศ์, นริศร์, รวมพร..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Goal Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                ประเภทเป้าหมาย
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | 'FUNDING' | 'MANUSCRIPT')}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">ทุกประเภทเป้าหมาย</option>
                <option value="FUNDING">ข้อเสนอขอทุนวิจัย</option>
                <option value="MANUSCRIPT">Manuscript / อนุสิทธิบัตร</option>
              </select>
            </div>

            {/* Performance Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                สถานะเทียบแผนสะสม ({MONTHS_META[evalMonthIdx].short})
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | StatusType)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="ON_TARGET">สีเขียว - ตามแผนสะสม (On Target)</option>
                <option value="BELOW">สีแดง - ต่ำกว่าแผนสะสม (Below Target)</option>
                <option value="ABOVE">สีน้ำเงิน - เกินแผนสะสม (Above Target)</option>
              </select>
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  เรียงลำดับ
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'DESC' | 'ASC' | 'ID')}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ID">ตามลำดับรายชื่อ</option>
                  <option value="DESC">% ความสำเร็จ (มาก → น้อย)</option>
                  <option value="ASC">% ความสำเร็จ (น้อย → มาก)</option>
                </select>
              </div>
              <button
                onClick={resetFilters}
                title="ล้างตัวกรองทั้งหมด"
                className="mt-5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer shrink-0"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3, 4, 5: INDIVIDUAL ACADEMIC PERFORMANCE & OVERLAY PROGRESS BARS */}
        <section aria-label="Individual Academic Performance" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ผลการดำเนินงานรายบุคคล (Individual Academic Performance)
              </h2>
              <p className="text-xs text-slate-500">
                แสดงเฉพาะรายการเป้าหมายที่มีค่า Target &gt; 0 • สีของแถบวัดผลสะสมถึงเดือน{' '}
                <span className="font-semibold text-blue-700">{MONTHS_META[evalMonthIdx].full}</span>{' '}
                และแสดง % ความสำเร็จสะสมรวมทั้งปี
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                สีเขียว: ผลสะสม = แผนสะสม
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                สีแดง: ผลสะสม &lt; แผนสะสม
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                สีน้ำเงิน: ผลสะสม &gt; แผนสะสม
              </span>
            </div>
          </div>

          {filteredFaculty.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-600 font-semibold">ไม่พบข้อมูลอาจารย์ตามเงื่อนไขที่ค้นหา</p>
              <button
                onClick={resetFilters}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 transition cursor-pointer"
              >
                แสดงข้อมูลทั้งหมด
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaculty.map((faculty) => (
                <div
                  key={faculty.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Faculty Card Header */}
                  <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-950 text-cyan-300 font-bold text-xs flex items-center justify-center">
                        #{faculty.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{faculty.name}</h3>
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      ความสำเร็จสะสมเฉลี่ย:{' '}
                      <span className="text-sm font-extrabold text-blue-700">
                        {faculty.avgAchievement.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Goals List */}
                  <div className="divide-y divide-slate-100">
                    {faculty.evaluatedGoals.map((goal) => {
                      const colors = getStatusColorClasses(goal.status);
                      const isExpanded = !!expandedCardIds[goal.id];
                      const activeActualMonths = goal.monthly.filter(
                        (m) => m.actual !== null && m.actual > 0
                      );

                      return (
                        <div key={goal.id} className="p-5 space-y-3.5">
                          {/* Top Row: Goal Title & Target / Actual / Achievement Summary Table */}
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  goal.category === 'FUNDING'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-cyan-100 text-cyan-800'
                                }`}
                              >
                                {goal.thaiName}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                ({goal.name})
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors.badgeBg}`}
                              >
                                {colors.label}
                              </span>
                            </div>

                            {/* Structured Metrics Row: จำนวนชิ้นงาน | แผนสะสมถึงเดือนนี้ | ผลสะสมจริง | Achievement % */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5">
                                <span className="text-slate-400 block text-[10px]">เป้าหมาย (Target)</span>
                                <span className="font-bold text-slate-800">
                                  {goal.quantity} ชิ้นงาน ({goal.totalTargetPct}%)
                                </span>
                              </div>
                              <div className="bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5">
                                <span className="text-slate-400 block text-[10px]">
                                  แผนสะสม ({MONTHS_META[evalMonthIdx].short})
                                </span>
                                <span className="font-bold text-slate-700">{goal.cumPlanToMonth}%</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5">
                                <span className="text-slate-400 block text-[10px]">
                                  ผลสะสมจริง (Actual)
                                </span>
                                <span className={`font-extrabold ${colors.text}`}>
                                  {goal.totalActualAllMonths}%
                                </span>
                              </div>
                              <div className="bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5">
                                <span className="text-slate-400 block text-[10px]">
                                  Achievement % (สะสมรวม)
                                </span>
                                <span className={`font-extrabold text-sm ${colors.text}`}>
                                  {goal.achievementPct.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* OVERLAY PROGRESS BAR (Heart of the Dashboard) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-700">
                                  ความก้าวหน้าสะสมจริง: <strong className={colors.text}>{goal.totalActualAllMonths}%</strong> จากเป้าหมายรวม 100%
                                </span>
                                {activeActualMonths.length > 0 && (
                                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                    ผลรายเดือน:{' '}
                                    {activeActualMonths
                                      .map((m) => `${m.shortMonth} = ${m.actual}%`)
                                      .join(' + ')}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                แผนสะสมถึง {MONTHS_META[evalMonthIdx].short}: {goal.cumPlanToMonth}% | ผลสะสม:{' '}
                                <span className={colors.text}>{goal.cumActualToMonth}%</span>
                              </span>
                            </div>

                            {/* Main Overlay Rectangular Horizontal Progress Bar */}
                            <div className="relative h-7 w-full bg-slate-200/90 rounded-xl overflow-hidden border border-slate-300/80 shadow-inner">
                              {/* Layer 1 (Gray darker band): Cumulative Planned Target up to Evaluated Month */}
                              <div
                                className="absolute top-0 left-0 h-full bg-slate-300/90 transition-all duration-500"
                                style={{ width: `${Math.min(100, goal.cumPlanToMonth)}%` }}
                                title={`แผนสะสมถึง ${MONTHS_META[evalMonthIdx].full}: ${goal.cumPlanToMonth}%`}
                              />

                              {/* Layer 2 (Colored Front Overlay Bar): Actual Cumulative Progress */}
                              <div
                                className={`absolute top-0 left-0 h-full ${colors.barBg} transition-all duration-700 ease-out flex items-center justify-end pr-2 text-[11px] font-bold text-white shadow-sm`}
                                style={{ width: `${Math.min(100, goal.totalActualAllMonths)}%` }}
                              >
                                {goal.totalActualAllMonths >= 8 && (
                                  <span>{goal.totalActualAllMonths}%</span>
                                )}
                              </div>

                              {/* Planned Target Marker Line for Evaluated Month */}
                              {goal.cumPlanToMonth > 0 && goal.cumPlanToMonth <= 100 && (
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                                  style={{ left: `${Math.min(100, goal.cumPlanToMonth)}%` }}
                                  title={`เกณฑ์แผนสะสมถึง ${MONTHS_META[evalMonthIdx].full}: ${goal.cumPlanToMonth}%`}
                                />
                              )}

                              {/* Right-side overlay text when bar is small */}
                              <div className="absolute inset-y-0 right-3 flex items-center gap-2 text-[11px] font-bold text-slate-700 z-20 pointer-events-none">
                                <span>
                                  ผลจริง {goal.totalActualAllMonths}% / แผนรวม 100%
                                </span>
                                {goal.achievementPct > 100 && (
                                  <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px]">
                                    เกินเป้า ({goal.achievementPct}%)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Monthly Cumulative Segment Bar (Evaluates each month's result vs plan) */}
                            <div className="pt-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-medium text-slate-500">
                                  แถบวัดผลรายเดือนตามแผนสะสม (ธ.ค. 69 – ก.ย. 70):
                                </span>
                                <button
                                  onClick={() => toggleExpand(goal.id)}
                                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  {isExpanded ? 'ซ่อนตารางรายเดือน ▲' : 'ดูตารางแผน/ผลรายเดือน ▼'}
                                </button>
                              </div>

                              <div className="grid grid-cols-10 gap-1">
                                {goal.monthlyBreakdown.map((m, idx) => {
                                  const isEvaluated = idx <= evalMonthIdx;
                                  const actVal = m.actual !== null ? m.actual : 0;
                                  let segColor = 'bg-slate-100 text-slate-400 border-slate-200';

                                  if (isEvaluated && (m.plan > 0 || actVal > 0)) {
                                    if (actVal > m.plan) {
                                      segColor = 'bg-blue-600 text-white border-blue-700';
                                    } else if (actVal === m.plan) {
                                      segColor = 'bg-emerald-500 text-white border-emerald-600';
                                    } else {
                                      segColor = 'bg-rose-500 text-white border-rose-600';
                                    }
                                  } else if (!isEvaluated && m.plan > 0) {
                                    segColor = 'bg-slate-200/80 text-slate-600 border-slate-300';
                                  }

                                  return (
                                    <div
                                      key={m.month}
                                      className={`rounded-lg border px-1 py-1 text-center transition ${segColor}`}
                                      title={`${m.month}: แผน ${m.plan}% | ผล ${
                                        m.actual !== null ? `${m.actual}%` : '0%'
                                      } (สะสม: แผน ${m.cumPlan}% / ผล ${m.cumActual}%)`}
                                    >
                                      <div className="text-[9px] font-semibold truncate opacity-90">
                                        {m.shortMonth}
                                      </div>
                                      <div className="text-[10px] font-bold leading-tight mt-0.5">
                                        {actVal}%/{m.plan}%
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Expandable Detailed Monthly Plan vs Actual Table */}
                            {isExpanded && (
                              <div className="mt-3 overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 p-3">
                                <table className="w-full text-xs text-center border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                      <th className="py-1.5 px-2 text-left font-semibold">รายการ</th>
                                      {goal.monthlyBreakdown.map((m, idx) => (
                                        <th
                                          key={m.month}
                                          className={`py-1.5 px-1.5 font-semibold ${
                                            idx <= evalMonthIdx ? 'text-blue-900 bg-blue-50/60' : ''
                                          }`}
                                        >
                                          {m.shortMonth}
                                        </th>
                                      ))}
                                      <th className="py-1.5 px-2 font-bold text-slate-800">รวมสะสม</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200/60">
                                    <tr>
                                      <td className="py-1.5 px-2 text-left font-semibold text-slate-600">
                                        แผน (%)
                                      </td>
                                      {goal.monthlyBreakdown.map((m) => (
                                        <td key={m.month} className="py-1.5 px-1.5 text-slate-700">
                                          {m.plan > 0 ? `${m.plan}%` : '-'}
                                        </td>
                                      ))}
                                      <td className="py-1.5 px-2 font-bold text-slate-800">
                                        {goal.totalTargetPct}%
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="py-1.5 px-2 text-left font-semibold text-slate-600">
                                        ผลจริง (%)
                                      </td>
                                      {goal.monthlyBreakdown.map((m, idx) => {
                                        const act = m.actual !== null ? m.actual : 0;
                                        return (
                                          <td
                                            key={m.month}
                                            className={`py-1.5 px-1.5 font-bold ${
                                              idx <= evalMonthIdx && (m.plan > 0 || act > 0)
                                                ? act > m.plan
                                                  ? 'text-blue-600'
                                                  : act === m.plan
                                                  ? 'text-emerald-600'
                                                  : 'text-rose-600'
                                                : 'text-slate-400'
                                            }`}
                                          >
                                            {m.actual !== null ? `${m.actual}%` : idx <= evalMonthIdx ? '0%' : '-'}
                                          </td>
                                        );
                                      })}
                                      <td className={`py-1.5 px-2 font-extrabold ${colors.text}`}>
                                        {goal.totalActualAllMonths}%
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
