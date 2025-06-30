'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle, Upload } from "lucide-react"
import { LeadTable } from "@/components/dashboard/lead-table"
import { getLeads } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadFilters } from "@/components/dashboard/lead-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Lead } from "@/lib/types"
import { AddLeadDialog } from "@/components/add-lead-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    async function loadLeads() {
      setIsLoading(true);
      const initialLeads = await getLeads();
      setAllLeads(initialLeads);
      setIsLoading(false);
    }
    loadLeads();
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const results = allLeads.filter(lead => 
        lead.name.toLowerCase().includes(lowercasedQuery) ||
        lead.email.toLowerCase().includes(lowercasedQuery) ||
        lead.phone.includes(searchQuery) // phone is not always case-insensitive
      );
      setFilteredLeads(results);
    } else {
      setFilteredLeads(allLeads);
    }
  }, [searchQuery, allLeads]);

  const handleLeadAdded = (newLead: Lead) => {
    const updatedLeads = [newLead, ...allLeads];
    setAllLeads(updatedLeads);
    setFilteredLeads(updatedLeads);
  }

  const handleLeadUpdated = (updatedLead: Lead) => {
    const updatedLeads = allLeads.map(l => l.id === updatedLead.id ? updatedLead : l)
    setAllLeads(updatedLeads);
    setFilteredLeads(updatedLeads);
  }

  const handleLeadDeleted = (leadId: string) => {
    const updatedLeads = allLeads.filter(l => l.id !== leadId)
    setAllLeads(updatedLeads);
    setFilteredLeads(updatedLeads);
  }

  const leadsForStats = allLeads;
  const newLeadsCount = leadsForStats.filter(l => l.status === 'New').length;
  const qualifiedLeadsCount = leadsForStats.filter(l => l.status === 'Qualified').length;
  const convertedLeadsCount = leadsForStats.filter(l => l.status === 'Converted').length;

  const currentLeads = searchQuery ? filteredLeads : allLeads;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your leads.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
            <AddLeadDialog onLeadAdded={handleLeadAdded}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </AddLeadDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
            <>
              <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
            </>
        ) : (
          <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{leadsForStats.length}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{newLeadsCount}</div>
                    <p className="text-xs text-muted-foreground">In the last 7 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{qualifiedLeadsCount}</div>
                    <p className="text-xs text-muted-foreground">+12 since yesterday</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Converted</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{convertedLeadsCount}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader><Skeleton className="h-10 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
              <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="contacted">Contacted</TabsTrigger>
                  <TabsTrigger value="qualified">Qualified</TabsTrigger>
              </TabsList>
              <LeadFilters />
          </div>
          <TabsContent value="all" className="mt-4">
            <LeadTable leads={currentLeads} onLeadUpdated={handleLeadUpdated} onLeadDeleted={handleLeadDeleted} />
          </TabsContent>
          <TabsContent value="new" className="mt-4">
            <LeadTable leads={currentLeads.filter(l => l.status === 'New')} onLeadUpdated={handleLeadUpdated} onLeadDeleted={handleLeadDeleted} />
          </TabsContent>
          <TabsContent value="contacted" className="mt-4">
            <LeadTable leads={currentLeads.filter(l => l.status === 'Contacted')} onLeadUpdated={handleLeadUpdated} onLeadDeleted={handleLeadDeleted} />
          </TabsContent>
          <TabsContent value="qualified" className="mt-4">
            <LeadTable leads={currentLeads.filter(l => l.status === 'Qualified')} onLeadUpdated={handleLeadUpdated} onLeadDeleted={handleLeadDeleted} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
