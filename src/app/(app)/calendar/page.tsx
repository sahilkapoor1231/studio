'use client'

import React, { useState } from 'react'
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tasks = [
    { date: '2024-07-25', title: 'Follow up with Emily Davis', type: 'Call'},
    { date: '2024-07-25', title: 'Send info to John Doe', type: 'Message'},
    { date: '2024-07-28', title: 'Appointment: Michael Johnson', type: 'Appointment'},
    { date: '2024-08-02', title: 'Call Jane Smith', type: 'Call'},
];

export default function CalendarPage() {
  let today = startOfToday()
  let [selectedDay, setSelectedDay] = useState(today)
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  })

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  let selectedDayTasks = tasks.filter((task) =>
    isSameDay(parse(task.date, 'yyyy-MM-dd', new Date()), selectedDay)
  )

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Manage your tasks and appointments.</p>
        </div>
        <Card>
            <CardContent className="p-4 md:p-6">
                <div className="md:grid md:grid-cols-2 md:divide-x">
                    <div className="pr-0 md:pr-8">
                        <div className="flex items-center">
                            <h2 className="flex-auto font-semibold">
                                {format(firstDayCurrentMonth, 'MMMM yyyy')}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={previousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-4 grid grid-cols-7 text-center text-xs leading-6 text-muted-foreground">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                        </div>
                        <div className="mt-2 grid grid-cols-7 text-sm">
                            {days.map((day, dayIdx) => (
                            <div
                                key={day.toString()}
                                className={cn(
                                dayIdx === 0 && colStartClasses[getDay(day)],
                                'py-1.5'
                                )}
                            >
                                <button
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                    'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                                    isEqual(day, selectedDay) && 'text-white',
                                    !isEqual(day, selectedDay) && isToday(day) && 'text-primary',
                                    !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'text-foreground',
                                    !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-muted-foreground',
                                    isEqual(day, selectedDay) && isToday(day) && 'bg-primary',
                                    isEqual(day, selectedDay) && !isToday(day) && 'bg-primary/90',
                                    !isEqual(day, selectedDay) && 'hover:bg-accent',
                                    (isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
                                )}
                                >
                                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                                        {format(day, 'd')}
                                    </time>
                                </button>
                                <div className="w-1 h-1 mx-auto mt-1">
                                    {tasks.some(task => isSameDay(parse(task.date, 'yyyy-MM-dd', new Date()), day)) && (
                                        <div className="w-1 h-1 rounded-full bg-accent-foreground"></div>
                                    )}
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                    <section className="mt-12 md:mt-0 md:pl-8">
                        <h2 className="font-semibold">
                            Schedule for <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>{format(selectedDay, 'PP')}</time>
                        </h2>
                        <ol className="mt-4 space-y-3">
                        {selectedDayTasks.length > 0 ? (
                            selectedDayTasks.map((task, i) => (
                                <li key={i} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{task.title}</p>
                                    </div>
                                    <Badge variant={task.type === 'Appointment' ? 'default' : 'outline'}>{task.type}</Badge>
                                </li>
                            ))
                        ) : (
                            <p>No tasks for today.</p>
                        )}
                        </ol>
                    </section>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}

let colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
]
