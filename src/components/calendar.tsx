"use client"

import React, { useState, useMemo } from "react"

type Props = {
  selected?: string // YYYY-MM-DD
  onSelect?: (dateISO: string) => void
}

function formatISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function Calendar({ selected, onSelect }: Props) {
  const today = useMemo(() => new Date(), [])
  const [base, setBase] = useState(() => {
    if (selected) return new Date(selected + "T00:00:00")
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const year = base.getFullYear()
  const month = base.getMonth()

  function prevMonth() {
    setBase(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setBase(new Date(year, month + 1, 1))
  }

  const firstDay = new Date(year, month, 1).getDay() // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const weeks: Array<Array<number | null>> = []
  let week: Array<number | null> = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  function handleSelect(dayNum: number | null) {
    if (!dayNum) return
    const d = new Date(year, month, dayNum)
    const iso = formatISO(d)
    onSelect?.(iso)
  }

  const selectedDate = selected ? new Date(selected + "T00:00:00") : null

  return (
    <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">◀</button>
        <div className="text-sm font-semibold">{base.toLocaleString("pt-BR", { month: "long" })} {year}</div>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">▶</button>
      </div>

      <div className="grid grid-cols-7 text-xs text-gray-500 gap-1 mb-2">
        <div className="text-center">DOM</div>
        <div className="text-center">SEG</div>
        <div className="text-center">TER</div>
        <div className="text-center">QUA</div>
        <div className="text-center">QUI</div>
        <div className="text-center">SEX</div>
        <div className="text-center">SÁB</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((w, i) => (
          <React.Fragment key={i}>
            {w.map((d, j) => {
              const isToday = d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
              const isSelected = d && selectedDate && d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
              return (
                <button
                  key={j}
                  onClick={() => handleSelect(d)}
                  className={`w-full h-9 rounded-md flex items-center justify-center text-sm ${d ? "hover:bg-gray-100" : ""} ${isSelected ? "bg-[var(--theme-primary)] text-white" : "text-gray-700"} ${isToday && !isSelected ? "border border-[var(--theme-primary)]" : ""}`}
                  disabled={!d}
                >
                  {d || ""}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
