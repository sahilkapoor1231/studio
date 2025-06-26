'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart,
  Calendar,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from './ui/button'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: BarChart },
];

export function AppSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            LeadFlow
          </h1>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
            <div className="rounded-lg bg-sidebar-accent p-4 text-center">
                <h3 className="font-semibold text-sidebar-accent-foreground">Upgrade Your Plan</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    Get more features and remove all limits.
                </p>
                <Button variant="primary" size="sm" className="mt-3 w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                    Upgrade Now
                </Button>
            </div>
        </div>
        
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-3 border-t p-2">
          <Avatar>
            <AvatarImage src="https://placehold.co/100x100.png" alt="Jane Doe" data-ai-hint="person face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              Jane Doe
            </p>
            <p className="truncate text-xs text-muted-foreground">
              jane.doe@example.com
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}
