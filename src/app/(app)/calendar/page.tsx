'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTasks } from '@/lib/data'
import type { Task } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  let today = startOfToday()
  let [selectedDay, setSelectedDay] = useState(today)
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())

  useEffect(() => {
    async function loadTasks() {
        setIsLoading(true);
        const fetchedTasks = await getTasks();
        // Sort tasks by due date
        fetchedTasks.sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
        setTasks(fetchedTasks);
        setIsLoading(false);
    }
    loadTasks();
  }, [])

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
    isSameDay(parseISO(task.dueDate), selectedDay)
  )

  const taskTypeColors: Record<Task['type'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
    'Appointment': 'default',
    'Call': 'secondary',
    'Message': 'outline'
  }

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
                                    {tasks.some(task => isSameDay(parseISO(task.dueDate), day)) && (
                                        <div className="w-1 h-1 rounded-full bg-primary/50"></div>
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
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : selectedDayTasks.length > 0 ? (
                            selectedDayTasks.map((task) => (
                                <li key={task.id} className="flex items-start gap-3 rounded-lg bg-secondary p-3">
                                    <div className="flex items-center justify-center bg-primary/10 text-primary rounded-md h-9 w-12 flex-col text-xs font-bold">
                                        <span>{format(parseISO(task.dueDate), 'p')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <Link href={`/leads/${task.lead.id}`} className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                                            <Avatar className="h-4 w-4 border text-xs">
                                                <AvatarImage src={task.lead.photoUrl} alt={task.lead.name} data-ai-hint="person face" />
                                                <AvatarFallback>{task.lead.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {task.lead.name}
                                        </Link>
                                    </div>
                                    <Badge variant={taskTypeColors[task.type]} className={cn(task.status === 'Overdue' && 'bg-destructive text-destructive-foreground')}>
                                        {task.status === 'Overdue' ? 'Overdue' : task.type}
                                    </Badge>
                                </li>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No tasks for today.</p>
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
