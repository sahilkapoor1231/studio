'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'
import { ListFilter } from 'lucide-react'
import type { LeadSource, User } from '@/lib/types'

type Filters = {
    sources: string[];
    assignedTo: string[];
    statuses: string[];
}

interface LeadFiltersProps {
    filters: Filters;
    onFilterChange: (filterType: keyof Filters, value: string) => void;
    clearFilters: () => void;
    sources: readonly LeadSource[];
    users: User[];
    statuses: string[];
}

export function LeadFilters({ filters, onFilterChange, clearFilters, sources, users, statuses }: LeadFiltersProps) {
  const activeFilterCount = filters.sources.length + filters.assignedTo.length + filters.statuses.length;

  const handleCheckedChange = (filterType: keyof Filters, value: string) => (checked: boolean) => {
    onFilterChange(filterType, value);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
            {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{activeFilterCount}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Source</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {sources.map((source) => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={filters.sources.includes(source)}
                  onCheckedChange={handleCheckedChange('sources', source)}
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Assigned To</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {users.map((user) => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={filters.assignedTo.includes(user.id)}
                  onCheckedChange={handleCheckedChange('assignedTo', user.id)}
                >
                  {user.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.statuses.includes(status)}
                  onCheckedChange={handleCheckedChange('statuses', status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {activeFilterCount > 0 && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={clearFilters} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    Clear all filters
                </DropdownMenuItem>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
