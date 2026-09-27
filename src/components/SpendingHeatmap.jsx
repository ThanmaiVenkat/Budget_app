import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Flame, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatRupees } from '../utils/mockData';

// ---------------------------------------------------------------------------
// Heatmap palette – five tiers that progress from "calm" to "hot".
// Light theme: sage-green → yellow-green → amber → burnt orange → deep red
// Dark theme: lifted versions of the same hue ramp
// ---------------------------------------------------------------------------
const LIGHT_RAMP = ['#D6E8CC', '#E2D78F', '#F0BC5E', '#E88B3C', '#C44A2D'];
const DARK_RAMP  = ['#2A3D22', '#3C3822', '#4D3A1A', '#5A2E18', '#6E241A'];
const EMPTY_LIGHT = 'var(--bg-card-hover)';
const EMPTY_DARK  = 'var(--bg-card-hover)';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Return which colour-ramp index a day's amount falls into. The tiers are
// quantile-based: we collect all non-zero daily totals for the month, sort
// them, and cut at 20/40/60/80 percentile. A day with zero spending gets -1
// (the "empty" tile colour).
function tierIndex(amount, thresholds) {
  if (!amount || amount <= 0) return -1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (amount >= thresholds[i]) return i;
  }
  return 0;
}

function computeThresholds(dailyMap) {
  const vals = Object.values(dailyMap).filter(v => v > 0).sort((a, b) => a - b);
  if (vals.length === 0) return [0, 0, 0, 0, 0];
  if (vals.length === 1) return [vals[0], vals[0], vals[0], vals[0], vals[0]];
  const p = (pct) => vals[Math.min(Math.floor(pct * vals.length), vals.length - 1)];
  return [p(0), p(0.2), p(0.4), p(0.6), p(0.8)];
}

// Build a { 'YYYY-MM-DD': totalSpent } map from the filtered transactions.
function buildDailyMap(transactions) {
  const map = {};
  (transactions || []).forEach(tx => {
    if (tx.type !== 'expense' || !tx.date) return;
    map[tx.date] = (map[tx.date] || 0) + (tx.amount || 0);
  });
  return map;
}

// The grid cells for a month: leading blanks for the first week, then 1..N.
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();   // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);  // leading blanks
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function SpendingHeatmap({
  transactions = [],
  activeMemberId = 'all',
  selectedMonth = '',
  categories = [],
}) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipSide, setTooltipSide] = useState('below');
  const gridRef = useRef(null);
  const tooltipRef = useRef(null);

  // Determine the dark-mode state via a CSS query so the heatmap tiles can use
  // the right ramp branch without an extra prop.
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => {
      const html = document.documentElement;
      if (html.getAttribute('data-theme') === 'dark') return true;
      if (html.getAttribute('data-theme') === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    setIsDark(check());
    const obs = new MutationObserver(() => setIsDark(check()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setIsDark(check());
    mql.addEventListener('change', handler);
    return () => { obs.disconnect(); mql.removeEventListener('change', handler); };
  }, []);

  const ramp = isDark ? DARK_RAMP : LIGHT_RAMP;
  const emptyColor = isDark ? EMPTY_DARK : EMPTY_LIGHT;

  // Parse month key (e.g. '2026-09')
  const [year, month] = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'all') {
      const now = new Date();
      return [now.getFullYear(), now.getMonth()];
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m - 1]; // JS months are 0-based
  }, [selectedMonth]);

  const pad = n => String(n).padStart(2, '0');

  // Filter transactions for this month + active member
  const monthTxs = useMemo(() => {
    const mk = `${year}-${pad(month + 1)}`;
    return (transactions || []).filter(tx => {
      const matchesMember = activeMemberId === 'all' || tx.memberId === activeMemberId;
      const matchesMonth = tx.date && tx.date.startsWith(mk);
      return matchesMember && matchesMonth;
    });
  }, [transactions, year, month, activeMemberId]);

  const dailyMap = useMemo(() => buildDailyMap(monthTxs), [monthTxs]);
  const thresholds = useMemo(() => computeThresholds(dailyMap), [dailyMap]);
  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  // Summary stats
  const totalSpent = useMemo(
    () => Object.values(dailyMap).reduce((s, v) => s + v, 0), [dailyMap]);
  const daysWithSpending = useMemo(
    () => Object.values(dailyMap).filter(v => v > 0).length, [dailyMap]);
  const peakDay = useMemo(() => {
    let maxDay = null, maxAmt = 0;
    Object.entries(dailyMap).forEach(([date, amt]) => {
      if (amt > maxAmt) { maxAmt = amt; maxDay = date; }
    });
    return maxDay ? { date: maxDay, amount: maxAmt } : null;
  }, [dailyMap]);

  // Daily breakdown for tooltip
  const dayTxs = useMemo(() => {
    if (hoveredDay === null) return [];
    const dateKey = `${year}-${pad(month + 1)}-${pad(hoveredDay)}`;
    return monthTxs.filter(tx => tx.date === dateKey && tx.type === 'expense');
  }, [hoveredDay, year, month, monthTxs]);

  const handleCellHover = (day, e) => {
    if (!day) return;
    setHoveredDay(day);
    const cell = e.currentTarget;
    const gridRect = gridRef.current?.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    if (gridRect) {
      const x = cellRect.left - gridRect.left + cellRect.width / 2;
      const y = cellRect.top - gridRect.top;
      // If the cell is in the top two rows, show tooltip below; otherwise above
      const row = Math.floor(grid.indexOf(day) / 7);
      setTooltipSide(row < 2 ? 'below' : 'above');
      setTooltipPos({ x, y: row < 2 ? y + cellRect.height + 8 : y - 8 });
    }
  };

  const handleCellLeave = () => setHoveredDay(null);

  const today = new Date();
  const todayDate = today.getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-card" style={{ overflow: 'visible' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-tint), var(--danger-tint))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={16} color="var(--accent-strong)" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.2' }}>
              Spending Heatmap
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {monthName}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        marginBottom: '14px',
      }}>
        <div style={{
          background: 'var(--bg-hero)', borderRadius: '10px', padding: '8px 10px',
          border: '1px solid var(--bg-hero-border)',
        }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
            Total
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {formatRupees(totalSpent)}
          </div>
        </div>
        <div style={{
          background: 'var(--bg-hero)', borderRadius: '10px', padding: '8px 10px',
          border: '1px solid var(--bg-hero-border)',
        }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
            Active Days
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {daysWithSpending} <span style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>
        <div style={{
          background: 'var(--bg-hero)', borderRadius: '10px', padding: '8px 10px',
          border: '1px solid var(--bg-hero-border)',
        }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
            Peak Day
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: peakDay ? 'var(--danger)' : 'var(--text-muted)' }}>
            {peakDay
              ? new Date(peakDay.date + 'T00:00:00').getDate()
              : '—'
            }
            {peakDay && (
              <span style={{ fontSize: '0.62rem', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '2px' }}>
                ({formatRupees(peakDay.amount)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div ref={gridRef} style={{ position: 'relative', userSelect: 'none' }}>
        {/* Weekday headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px',
          marginBottom: '4px',
        }}>
          {WEEKDAY_LABELS.map(label => (
            <div key={label} style={{
              textAlign: 'center', fontSize: '0.6rem', fontWeight: '700',
              color: 'var(--text-dim)', textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '2px 0',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px',
        }}>
          {grid.map((day, idx) => {
            if (day === null) {
              return <div key={`blank-${idx}`} style={{ aspectRatio: '1', borderRadius: '6px' }} />;
            }
            const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
            const spent = dailyMap[dateKey] || 0;
            const tier = tierIndex(spent, thresholds);
            const isToday = isCurrentMonth && day === todayDate;
            const isHovered = hoveredDay === day;
            const isWeekend = idx % 7 === 0 || idx % 7 === 6;

            const bgColor = tier >= 0 ? ramp[tier] : emptyColor;

            return (
              <div
                key={day}
                onMouseEnter={e => handleCellHover(day, e)}
                onMouseLeave={handleCellLeave}
                onTouchStart={e => handleCellHover(day, e)}
                onTouchEnd={handleCellLeave}
                style={{
                  aspectRatio: '1',
                  borderRadius: '6px',
                  background: bgColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s var(--ease-out), box-shadow 0.15s var(--ease-out)',
                  transform: isHovered ? 'scale(1.18)' : 'scale(1)',
                  boxShadow: isHovered ? 'var(--shadow-md)' : 'none',
                  border: isToday
                    ? '2px solid var(--accent)'
                    : isHovered
                      ? '1.5px solid var(--accent-border)'
                      : '1px solid transparent',
                  zIndex: isHovered ? 10 : 1,
                  position: 'relative',
                }}
              >
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: isToday ? '800' : isWeekend ? '700' : '600',
                  color: tier >= 3
                    ? (isDark ? '#F6EADC' : '#FFFAF3')
                    : tier >= 0
                      ? (isDark ? 'var(--text-main)' : 'var(--text-main)')
                      : 'var(--text-dim)',
                  lineHeight: '1',
                }}>
                  {day}
                </span>
                {spent > 0 && (
                  <span style={{
                    fontSize: '0.42rem',
                    fontWeight: '700',
                    color: tier >= 3
                      ? (isDark ? '#F6EADC' : '#FFFAF3')
                      : 'var(--text-muted)',
                    marginTop: '1px',
                    lineHeight: '1',
                    whiteSpace: 'nowrap',
                  }}>
                    {spent >= 1000 ? `₹${(spent / 1000).toFixed(1)}k` : `₹${Math.round(spent)}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredDay !== null && (
          <div
            ref={tooltipRef}
            style={{
              position: 'absolute',
              left: `${tooltipPos.x}px`,
              ...(tooltipSide === 'above'
                ? { bottom: `calc(100% - ${tooltipPos.y}px)` }
                : { top: `${tooltipPos.y}px` }),
              transform: 'translateX(-50%)',
              minWidth: '160px',
              maxWidth: '220px',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-card-border)',
              borderRadius: '12px',
              padding: '10px 12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              pointerEvents: 'none',
              animation: 'heatmapTooltipIn 0.15s var(--ease-out)',
            }}
          >
            <div style={{
              fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-main)',
              marginBottom: dayTxs.length > 0 ? '6px' : '0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>
                {new Date(year, month, hoveredDay).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </span>
              <span style={{
                fontWeight: '800',
                color: (dailyMap[`${year}-${pad(month + 1)}-${pad(hoveredDay)}`] || 0) > 0
                  ? 'var(--accent-strong)' : 'var(--text-dim)',
              }}>
                {formatRupees(dailyMap[`${year}-${pad(month + 1)}-${pad(hoveredDay)}`] || 0)}
              </span>
            </div>
            {dayTxs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayTxs.slice(0, 4).map((tx, i) => {
                  const cat = (categories || []).find(c => c.id === tx.category);
                  return (
                    <div key={tx.id || i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{
                        fontSize: '0.6rem', color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        {cat?.icon ? cat.icon + ' ' : ''}{tx.title || cat?.name || tx.category}
                      </span>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-main)',
                        flexShrink: 0,
                      }}>
                        {formatRupees(tx.amount)}
                      </span>
                    </div>
                  );
                })}
                {dayTxs.length > 4 && (
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                    +{dayTxs.length - 4} more
                  </div>
                )}
              </div>
            )}
            {dayTxs.length === 0 && (
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                No expenses this day
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', marginTop: '14px',
      }}>
        <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: '600' }}>Less</span>
        <div style={{ display: 'flex', gap: '3px' }}>
          <div style={{
            width: '14px', height: '14px', borderRadius: '3px',
            background: emptyColor, border: '1px solid var(--bg-card-border)',
          }} />
          {ramp.map((color, i) => (
            <div key={i} style={{
              width: '14px', height: '14px', borderRadius: '3px',
              background: color,
            }} />
          ))}
        </div>
        <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: '600' }}>More</span>
      </div>

      {/* Weekend insight */}
      <WeekendInsight dailyMap={dailyMap} year={year} month={month} pad={pad} />
    </div>
  );
}

// Small sub-component: compare weekday vs weekend average spending
function WeekendInsight({ dailyMap, year, month, pad }) {
  const insight = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let weekdayTotal = 0, weekdayCount = 0;
    let weekendTotal = 0, weekendCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${pad(month + 1)}-${pad(d)}`;
      const spent = dailyMap[dateKey] || 0;
      const dow = new Date(year, month, d).getDay();
      if (dow === 0 || dow === 6) {
        weekendTotal += spent;
        if (spent > 0) weekendCount++;
      } else {
        weekdayTotal += spent;
        if (spent > 0) weekdayCount++;
      }
    }

    const weekdayAvg = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
    const weekendAvg = weekendCount > 0 ? weekendTotal / weekendCount : 0;

    if (weekdayAvg === 0 && weekendAvg === 0) return null;

    const diff = weekendAvg - weekdayAvg;
    const pct = weekdayAvg > 0 ? Math.round((diff / weekdayAvg) * 100) : 0;

    return { weekdayAvg, weekendAvg, diff, pct };
  }, [dailyMap, year, month, pad]);

  if (!insight) return null;

  const isHigher = insight.diff > 0;

  return (
    <div style={{
      marginTop: '12px', padding: '8px 12px',
      background: 'var(--bg-hero)', borderRadius: '10px',
      border: '1px solid var(--bg-hero-border)',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      {isHigher
        ? <TrendingUp size={14} color="var(--danger)" />
        : <TrendingDown size={14} color="var(--positive)" />
      }
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        Weekend avg <b style={{ color: isHigher ? 'var(--danger)' : 'var(--positive)' }}>
          {formatRupees(Math.round(insight.weekendAvg))}
        </b>
        {insight.pct !== 0 && (
          <> — <b style={{ color: isHigher ? 'var(--danger)' : 'var(--positive)' }}>
            {isHigher ? '+' : ''}{insight.pct}%
          </b> vs weekday avg <b>{formatRupees(Math.round(insight.weekdayAvg))}</b></>
        )}
      </span>
    </div>
  );
}
