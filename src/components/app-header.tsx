'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, PlusCircle, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from './ui/badge'
import { AddLeadDialog } from './add-lead-dialog'
import { getTasks } from '@/lib/data'
import type { Task } from '@/lib/types'

export function AppHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [notifications, setNotifications] = useState<Task[]>([])

  useEffect(() => {
    async function loadNotifications() {
      const allTasks = await getTasks()
      const overdueTasks = allTasks.filter(t => t.status === 'Overdue')
      setNotifications(overdueTasks)
    }
    
    loadNotifications()

    const handleNotificationsUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notifications-updated', handleNotificationsUpdate);

    return () => {
      window.removeEventListener('notifications-updated', handleNotificationsUpdate);
    };
  }, [])

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard?q=${searchQuery}`)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold tracking-tight">LeadFlow</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial" onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        <AddLeadDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </AddLeadDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                 <Badge className="absolute -right-1 -top-1 h-4 w-4 justify-center p-0 text-xs" variant="destructive">{notifications.length}</Badge>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
                notifications.map(task => (
                    <DropdownMenuItem key={task.id} asChild>
                        <Link href={`/leads/${task.lead.id}`}>{task.title}</Link>
                    </DropdownMenuItem>
                ))
            ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
