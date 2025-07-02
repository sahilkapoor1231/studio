'use client'

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Download, PlusCircle, Upload, Loader2 } from "lucide-react"
import { LeadTable } from "@/components/dashboard/lead-table"
import { getLeads, addLead } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadFilters } from "@/components/dashboard/lead-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Lead, NewLeadPayload, LeadStage, LeadSource } from "@/lib/types"
import { AddLeadDialog } from "@/components/add-lead-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/app-context"

const allLeadSources: LeadSource[] = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp', 'Zapier', 'LinkedIn', 'Calendly'];

type FiltersState = {
    sources: string[];
    assignedTo: string[];
    statuses: string[];
};

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const importFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { assignableUsers, pipelineStages } = useAppContext();

  const [filters, setFilters] = useState<FiltersState>({ sources: [], assignedTo: [], statuses: [] });

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
    let tempLeads = [...allLeads];

    // Filter by search query first
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempLeads = tempLeads.filter(lead => 
        lead.name.toLowerCase().includes(lowercasedQuery) ||
        lead.email.toLowerCase().includes(lowercasedQuery) ||
        lead.phone.includes(searchQuery)
      );
    }

    // Then, filter by dropdown filters
    if (filters.sources.length > 0) {
        tempLeads = tempLeads.filter(lead => filters.sources.includes(lead.source));
    }
    if (filters.assignedTo.length > 0) {
        tempLeads = tempLeads.filter(lead => filters.assignedTo.includes(lead.assignedTo.id));
    }
    if (filters.statuses.length > 0) {
        tempLeads = tempLeads.filter(lead => filters.statuses.includes(lead.status));
    }

    setFilteredLeads(tempLeads);
  }, [searchQuery, allLeads, filters]);


  const handleFilterChange = (filterType: keyof FiltersState, value: string) => {
    setFilters(prev => {
        const newValues = new Set(prev[filterType]);
        if (newValues.has(value)) {
            newValues.delete(value);
        } else {
            newValues.add(value);
        }
        return {
            ...prev,
            [filterType]: Array.from(newValues),
        };
    });
  };

  const clearFilters = () => {
    setFilters({ sources: [], assignedTo: [], statuses: [] });
  }

  const handleLeadAdded = (newLead: Lead) => {
    setAllLeads(prevLeads => [newLead, ...prevLeads]);
  }

  const handleLeadUpdated = (updatedLead: Lead) => {
    setAllLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
  }

  const handleLeadDeleted = (leadId: string) => {
    setAllLeads(prevLeads => prevLeads.filter(l => l.id !== leadId));
  }

  const handleExport = () => {
    const dataToExport = filteredLeads.map(lead => ({
      ID: lead.id,
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Source: lead.source,
      Status: lead.status,
      "Assigned To": lead.assignedTo.name,
      "Last Contacted": lead.lastContacted,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'leads_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const handleImportClick = () => {
    importFileRef.current?.click();
  }
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast({
        title: "Importing Leads",
        description: "Your file is being processed. This may take a moment."
    });

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            let successCount = 0;
            let errorCount = 0;
            const newLeads: Lead[] = [];

            const requiredFields = ['name', 'email', 'phone', 'source', 'status'];

            for (const row of results.data as any[]) {
                const hasRequiredFields = requiredFields.every(field => row[field]);
                if (!hasRequiredFields) {
                    errorCount++;
                    continue;
                }
                
                try {
                    const payload: NewLeadPayload = {
                        name: row.name,
                        email: row.email,
                        phone: row.phone,
                        source: row.source,
                        status: row.status,
                        assignedToId: assignableUsers[0]?.id || '',
                        inquiryType: 'General OPD',
                        stage: 'Initial Inquiry' as LeadStage
                    };
                    const newLead = await addLead(payload);
                    newLeads.push(newLead);
                    successCount++;
                } catch (e) {
                    errorCount++;
                    console.error("Error importing row:", row, e);
                }
            }
            
            setAllLeads(prev => [...newLeads, ...prev]);

            setIsImporting(false);
            toast({
                title: "Import Complete",
                description: `${successCount} leads imported successfully. ${errorCount} rows failed.`
            });
        },
        error: (error) => {
            setIsImporting(false);
            toast({
                title: "Import Failed",
                description: "There was an error parsing your CSV file.",
                variant: "destructive"
            });
            console.error(error);
        }
    });

    if (event.target) {
        event.target.value = '';
    }
  };


  const leadsForStats = allLeads;
  const newLeadsCount = leadsForStats.filter(l => l.status === 'New').length;
  const qualifiedLeadsCount = leadsForStats.filter(l => l.status === 'Qualified').length;
  const convertedLeadsCount = leadsForStats.filter(l => l.status === 'Converted').length;

  const currentLeads = filteredLeads;

  return (
    <div className="space-y-6">
      <input type="file" ref={importFileRef} className="hidden" accept=".csv" onChange={handleFileImport} />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your leads.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                Import
            </Button>
            <Button variant="outline" onClick={handleExport}>
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
              <LeadFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                clearFilters={clearFilters}
                sources={allLeadSources}
                users={assignableUsers}
                statuses={pipelineStages.map(s => s.name).filter(s => s !== 'No Go')}
              />
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
