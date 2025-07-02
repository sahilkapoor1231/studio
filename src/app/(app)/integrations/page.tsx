'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ClipboardCopy, Loader2, Mail, ExternalLink, XCircle, BarChart, Calendar, Briefcase, Link as LinkIcon, Send } from "lucide-react";
import Link from "next/link";
import { getIntegrationSettings, createIntegrationSetting, deleteIntegrationSetting } from "@/lib/data";
import type { IntegrationSetting } from "@/lib/types";

// --- LOGO COMPONENTS ---
const ZapierLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.375 9.75H8.625V14.25H3.375V9.75Z" fill="#FF4A00"/>
        <path d="M8.625 5.25H14.25V9.75H8.625V5.25Z" fill="#FF4A00"/>
        <path d="M8.625 14.25H14.25V18.75H8.625V14.25Z" fill="#FF4A00"/>
        <path d="M15.75 3V7.5H20.25V3C18.2163 3 16.0688 3 15.75 3Z" fill="#FF4A00"/>
        <path d="M15.75 16.5V21H20.25V16.5C18.2163 16.5 16.0688 16.5 15.75 16.5Z" fill="#FF4A00"/>
    </svg>
);

const WhatsAppLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 21.8L7.18 20.45C8.62 21.21 10.28 21.62 12.04 21.62H12.05C17.5 21.62 21.95 17.17 21.95 11.72C21.95 9.12 20.92 6.72 19.16 4.96C17.4 3.2 14.8 2.13 12.04 2.13V2Z" fill="#25D366"/><path d="M9.73 7.95C9.53 7.54 9.32 7.53 9.15 7.53C9.01 7.53 8.81 7.58 8.63 7.75C8.46 7.92 7.93 8.41 7.93 9.33C7.93 10.25 8.66 11.12 8.78 11.27C8.91 11.42 10.27 13.56 12.35 14.38C14.44 15.2 14.44 14.88 14.85 14.84C15.26 14.8 16.14 14.32 16.32 13.84C16.5 13.36 16.5 12.96 16.44 12.83C16.38 12.7 16.23 12.63 16.03 12.51C15.82 12.38 14.89 11.93 14.7 11.85C14.51 11.78 14.36 11.73 14.22 11.93C14.07 12.13 13.66 12.63 13.53 12.78C13.41 12.93 13.28 12.96 13.08 12.83C12.87 12.71 12.08 12.45 11.13 11.6C10.37 10.92 9.89 10.1 9.73 9.83C9.56 9.56 9.68 9.44 9.79 9.33C9.89 9.23 10.02 9.07 10.12 8.95C10.22 8.83 10.27 8.73 10.32 8.63C10.37 8.53 10.32 8.43 10.27 8.35C10.22 8.28 9.92 7.95 9.73 7.95Z" fill="white"/></svg>
);

const MetaLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325V22.676C0 23.407 0.593 24 1.325 24H12.82V14.706H9.692V11.084H12.82V8.413C12.82 5.313 14.713 3.625 17.479 3.625C18.802 3.625 19.922 3.727 20.222 3.775V7.25H18.356C16.852 7.25 16.563 8.013 16.563 8.845V11.084H20.063L19.585 14.706H16.563V24H22.675C23.407 24 24 23.407 24 22.675V1.325C24 0.593 23.407 0 22.675 0Z" fill="#1877F2"/>
    </svg>
);

const GoogleAdsLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.25 2.00006L5.5 6.25006V15.0001L12.25 19.2501L19 15.0001V6.25006L12.25 2.00006Z" fill="#FBBC04"/>
        <path d="M12.25 11.5V19.25L19 15V6.25L12.25 11.5Z" fill="#F29900"/>
        <path d="M5.5 6.25L12.25 11.5L19 6.25L12.25 2L5.5 6.25Z" fill="#FCDA74"/>
        <path d="M11 14L8.5 12.5V9.5L11 8V14Z" fill="#4285F4"/>
        <path d="M11 8L13.5 9.5V12.5L11 14V8Z" fill="#8AB4F8"/>
    </svg>
);

const GoogleAnalyticsLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="12" width="5" height="8" rx="1" fill="#F4A800"/>
        <rect x="10" y="8" width="5" height="12" rx="1" fill="#E8710A"/>
        <rect x="16" y="4" width="5" height="16" rx="1" fill="#E8710A"/>
    </svg>
);

const LinkedInLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
       <rect width="24" height="24" rx="4" fill="#0A66C2"/>
       <path d="M9.4375 17.5H7V8H9.4375V17.5ZM8.1875 7.03125C7.46875 7.03125 6.875 6.4375 6.875 5.75C6.875 5.0625 7.46875 4.5 8.1875 4.5C8.90625 4.5 9.5 5.0625 9.5 5.75C9.5 6.4375 8.90625 7.03125 8.1875 7.03125ZM17.5 17.5H15.0625V12.9688C15.0625 11.7812 14.6562 11.0312 13.6875 11.0312C12.875 11.0312 12.3125 11.5938 12.0938 12.125C12.0625 12.3125 12.0312 12.5625 12.0312 12.8125V17.5H9.59375V8H12.0312V9.09375C12.375 8.53125 13.2188 7.8125 14.7188 7.8125C16.3125 7.8125 17.5 8.875 17.5 11.4375V17.5Z" fill="white"/>
   </svg>
);

const CalendlyLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#006BFF"/>
        <path d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 15.04 8.96 17.5 12 17.5C15.04 17.5 17.5 15.04 17.5 12H12V6.5Z" fill="white"/>
    </svg>
);

const HubSpotLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.22 16.94L12 15.15L8.78 16.94L9.88 13.34L7.13 11.16L10.5 10.95L12 7.75L13.5 10.95L16.88 11.16L14.13 13.34L15.22 16.94Z" fill="#FF7A59"/>
    </svg>
);

const GoogleCalendarLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#4285F4"/>
        <path d="M16 2V6M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <rect x="7" y="14" width="2" height="2" rx="0.5" fill="white"/>
        <rect x="11" y="14" width="2" height="2" rx="0.5" fill="white"/>
        <rect x="15" y="14" width="2" height="2" rx="0.5" fill="white"/>
    </svg>
);

const ZohoLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#E42526"/>
        <path d="M6.5 7H17.5L6.5 17H17.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- TYPE DEFINITIONS ---
type IntegrationId = 'zapier' | 'email' | 'meta' | 'google-ads' | 'whatsapp' | 'google-analytics' | 'linkedin' | 'calendly' | 'hubspot' | 'smtp' | 'bi-tools' | 'google-calendar' | 'zoho-crm';
type Integration = {
    id: IntegrationId;
    name: string;
    description: string;
    logo: JSX.Element;
};

// --- INTEGRATION DATA ---
const integrationsData: Integration[] = [
    {
        id: "zapier",
        name: "Zapier",
        description: "Connect this CRM to thousands of apps. The webhook will instantly capture lead data sent from any Zapier workflow.",
        logo: <ZapierLogo />,
    },
    {
        id: 'email',
        name: 'Lead Capture Email',
        description: "Generate a unique email address. Set up a rule in your email client to auto-forward new lead notifications to this address. The system will parse the email and create a new lead.",
        logo: <Mail className="w-10 h-10 text-primary" />,
    },
    {
        id: "whatsapp",
        name: "WhatsApp Business API",
        description: "Connect your WhatsApp Business account using your API key to enable automated messaging workflows from within the CRM.",
        logo: <WhatsAppLogo />,
    },
    {
        id: 'google-ads',
        name: 'Google Ads',
        description: "Generate a unique email address to use as the endpoint in your Google Ads Lead Form extensions. Leads will be captured in real-time.",
        logo: <GoogleAdsLogo />,
    },
     {
        id: "meta",
        name: "Meta Ads (Facebook & Instagram)",
        description: "Connect your account to capture leads from your Meta lead forms. This uses a secure OAuth flow where you grant permission to this app.",
        logo: <MetaLogo />,
    },
    {
        id: 'google-analytics',
        name: 'Google Analytics (GA4)',
        description: 'Add your GA4 Measurement ID to track lead sources, web interactions, and goal conversions directly within your analytics property.',
        logo: <GoogleAnalyticsLogo />,
    },
    {
        id: 'linkedin',
        name: 'LinkedIn Lead Gen Forms',
        description: "Connect your LinkedIn account to automatically capture leads from your B2B ad campaigns using a secure OAuth flow.",
        logo: <LinkedInLogo />,
    },
    {
        id: 'calendly',
        name: 'Calendly',
        description: 'Generate and add this webhook to your Calendly settings to automatically create tasks or leads when a new meeting is scheduled.',
        logo: <CalendlyLogo />,
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Connect your Google Calendar to sync appointments and availability. This uses a secure OAuth flow.',
        logo: <GoogleCalendarLogo />,
    },
    {
        id: 'hubspot',
        name: 'HubSpot CRM Sync',
        description: 'Enter your HubSpot API key to enable a (simulated) two-way sync for leads and contacts between both platforms.',
        logo: <HubSpotLogo />,
    },
    {
        id: 'zoho-crm',
        name: 'Zoho CRM Sync',
        description: 'Enter your Zoho API key to enable a (simulated) two-way sync for leads and contacts between both platforms.',
        logo: <ZohoLogo />,
    },
    {
        id: 'bi-tools',
        name: 'BI Tool Connector',
        description: 'Generate an API key to pull CRM data into Looker, Tableau, or Power BI for advanced custom reporting and analysis.',
        logo: <BarChart className="w-10 h-10 text-primary" />,
    },
    {
        id: 'smtp',
        name: 'SMTP / Email Sending',
        description: 'Configure your own SMTP server to send emails directly from the CRM, giving you full control over your email deliverability.',
        logo: <Send className="w-10 h-10 text-primary" />,
    },
];

// --- MAIN COMPONENT ---
export default function IntegrationsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<IntegrationSetting[]>([]);
    const [isLoading, setIsLoading] = useState<Partial<Record<IntegrationId, boolean>>>({});
    const [inputValues, setInputValues] = useState<Partial<Record<IntegrationId, string>>>({});
    const [smtpDetails, setSmtpDetails] = useState({ host: '', port: '', user: '', pass: '' });

    useEffect(() => {
        const loadSettings = async () => {
            // In a real app, this would get the current user's ID
            const fetchedSettings = await getIntegrationSettings('user-2');
            setSettings(fetchedSettings);
        }
        loadSettings();
    }, []);

    const copyToClipboard = (text: string, entity: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${entity} copied to clipboard!`,
        });
    }

    const handleConnectToggle = async (id: IntegrationId) => {
        setIsLoading(prev => ({ ...prev, [id]: true }));
        
        const existingSetting = settings.find(s => s.service === id);
        
        try {
            if (existingSetting) { // Disconnect
                await deleteIntegrationSetting('user-2', id);
                setSettings(prev => prev.filter(s => s.service !== id));
                if (id === 'smtp') setSmtpDetails({ host: '', port: '', user: '', pass: '' });
                toast({ title: `${integrationsData.find(i => i.id === id)?.name} integration disconnected.`});
            } else { // Connect
                const userValue = inputValues[id];
                let details;
                
                if (['whatsapp', 'hubspot', 'google-analytics', 'zoho-crm'].includes(id) && !userValue) {
                     toast({ title: "Value Required", description: "Please enter the required information.", variant: "destructive" });
                     setIsLoading(prev => ({ ...prev, [id]: false }));
                     return;
                }
                
                if (id === 'smtp') {
                    if (!smtpDetails.host || !smtpDetails.port || !smtpDetails.user || !smtpDetails.pass) {
                        toast({ title: "All SMTP fields are required", variant: "destructive" });
                        setIsLoading(prev => ({ ...prev, [id]: false }));
                        return;
                    }
                    details = smtpDetails;
                }

                const newSetting = await createIntegrationSetting('user-2', id, userValue, details);
                if (newSetting) {
                    setSettings(prev => [...prev, newSetting]);
                    toast({ title: "Integration Connected!" });
                } else {
                     throw new Error('Could not create integration setting.');
                }
            }
        } catch (error) {
             toast({
                title: "Connection Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(prev => ({ ...prev, [id]: false }));
        }
    }

    const renderCardContent = (integration: Integration) => {
        const setting = settings.find(s => s.service === integration.id);
        const loading = isLoading[integration.id];

        // --- UI for connected state ---
        if (setting) {
             let displayValue = '';
             const isSensitive = ['whatsapp', 'hubspot', 'smtp', 'zoho-crm'].includes(integration.id);
             if (isSensitive) {
                displayValue = `**********${setting.value.slice(-4)}`;
             } else {
                displayValue = setting.value;
             }

             if (integration.id === 'smtp' && setting.details) {
                 return (
                     <>
                        <CardContent className="flex-grow space-y-4">
                             <p className="text-sm text-green-600 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Active and connected.</span>
                            </p>
                             <p className="text-xs text-muted-foreground">
                                Host: {setting.details.host}<br/>
                                Port: {setting.details.port}<br/>
                                User: {setting.details.user}
                             </p>
                        </CardContent>
                        <CardFooter>
                           <Button onClick={() => handleConnectToggle(integration.id)} variant="destructive" className="w-32" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-2"/> Disconnect</>}
                            </Button>
                        </CardFooter>
                     </>
                 );
             }

             if (integration.id === 'bi-tools' && setting.token) {
                 return (
                     <>
                        <CardContent className="flex-grow space-y-4">
                            <div>
                                <Label htmlFor={`url-${integration.id}`}>Data Source URL</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input id={`url-${integration.id}`} readOnly value={setting.value} className="bg-muted" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(setting.value, 'URL')}>
                                        <ClipboardCopy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor={`key-${integration.id}`}>API Key</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input id={`key-${integration.id}`} readOnly value={`**********${setting.token.slice(-4)}`} className="bg-muted" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(setting.token!, 'API Key')}>
                                        <ClipboardCopy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleConnectToggle(integration.id)} variant="destructive" className="w-32" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-2"/> Disconnect</>}
                            </Button>
                        </CardFooter>
                     </>
                 )
             }

            return (
                 <>
                    <CardContent className="flex-grow">
                        <Label htmlFor={`url-${integration.id}`}>
                            {['zapier', 'calendly'].includes(integration.id) ? 'Your Webhook URL' : 
                             ['email', 'google-ads'].includes(integration.id) ? 'Your Unique Email Address' :
                             integration.id === 'google-analytics' ? 'Your Measurement ID' :
                             'Your API Key'}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input id={`url-${integration.id}`} readOnly value={displayValue} className="bg-muted" />
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(setting.value, 'Value')}>
                                <ClipboardCopy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Active and connected.</span>
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => handleConnectToggle(integration.id)} variant="destructive" className="w-32" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-2"/> Disconnect</>}
                        </Button>
                    </CardFooter>
                </>
            );
        }
        
        // --- UI for disconnected state ---
        
        const isOAuth = ['meta', 'linkedin', 'google-calendar'].includes(integration.id);
        if (isOAuth) {
            return (
                <>
                    <CardContent className="flex-grow" />
                    <CardFooter>
                        <Button asChild>
                            <Link href="#" onClick={(e) => {e.preventDefault(); toast({title: `Redirecting to ${integration.name}...`, description: "This is a simulated OAuth flow."})}}>
                                <ExternalLink className="mr-2" /> Connect with {integration.name}
                            </Link>
                        </Button>
                    </CardFooter>
                </>
            );
        }

        const isGenerated = ['zapier', 'email', 'google-ads', 'calendly', 'bi-tools'].includes(integration.id);
        if (isGenerated) {
            return (
                 <>
                    <CardContent className="flex-grow" />
                    <CardFooter>
                        <Button onClick={() => handleConnectToggle(integration.id)} className="w-32" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <><LinkIcon className="mr-2" /> Connect</>}
                        </Button>
                    </CardFooter>
                </>
            );
        }

        if (integration.id === 'smtp') {
            return (
                <>
                    <CardContent className="flex-grow space-y-2">
                        <Label htmlFor={`smtp-host`}>SMTP Host</Label>
                        <Input id={`smtp-host`} placeholder="smtp.example.com" value={smtpDetails.host} onChange={(e) => setSmtpDetails(p => ({...p, host: e.target.value}))} />
                        <Label htmlFor={`smtp-port`}>Port</Label>
                        <Input id={`smtp-port`} placeholder="587" value={smtpDetails.port} onChange={(e) => setSmtpDetails(p => ({...p, port: e.target.value}))} />
                        <Label htmlFor={`smtp-user`}>Username</Label>
                        <Input id={`smtp-user`} placeholder="your@email.com" value={smtpDetails.user} onChange={(e) => setSmtpDetails(p => ({...p, user: e.target.value}))} />
                        <Label htmlFor={`smtp-pass`}>Password</Label>
                        <Input id={`smtp-pass`} type="password" value={smtpDetails.pass} onChange={(e) => setSmtpDetails(p => ({...p, pass: e.target.value}))} />
                    </CardContent>
                     <CardFooter>
                         <Button onClick={() => handleConnectToggle(integration.id)} className="w-32" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <><LinkIcon className="mr-2" /> Connect</>}
                        </Button>
                    </CardFooter>
                </>
            )
        }

        // Handle API Key inputs (WhatsApp, HubSpot, GA, Zoho)
        const placeholder = integration.id === 'google-analytics' ? 'G-XXXXXXXXXX' : 'Enter your API key';
        const label = integration.id === 'google-analytics' ? 'Measurement ID' : 'Your API Key';
        const inputType = ['whatsapp', 'hubspot', 'zoho-crm'].includes(integration.id) ? 'password' : 'text';

        return (
            <>
                <CardContent className="flex-grow">
                    <Label htmlFor={`apikey-${integration.id}`}>{label}</Label>
                    <Input 
                        id={`apikey-${integration.id}`}
                        type={inputType}
                        placeholder={placeholder}
                        className="mt-1"
                        value={inputValues[integration.id] || ''}
                        onChange={(e) => setInputValues(prev => ({...prev, [integration.id]: e.target.value}))}
                    />
                </CardContent>
                <CardFooter>
                     <Button onClick={() => handleConnectToggle(integration.id)} className="w-32" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <><LinkIcon className="mr-2" /> Connect</>}
                    </Button>
                </CardFooter>
            </>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect your favorite tools to supercharge your lead management workflow.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {integrationsData.map(integration => (
                    <Card key={integration.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-start gap-4">
                            {integration.logo}
                            <div>
                                <CardTitle>{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                            </div>
                        </CardHeader>
                        {renderCardContent(integration)}
                    </Card>
                ))}
            </div>
        </div>
    )
}
