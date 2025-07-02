'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ClipboardCopy, Loader2, Mail, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";
import { getIntegrationSettings, createIntegrationSetting, deleteIntegrationSetting } from "@/lib/data";

// Simple SVG logos for demonstration
const ZapierLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.375 9.75H8.625V14.25H3.375V9.75Z" fill="#FF4A00"/>
        <path d="M8.625 5.25H14.25V9.75H8.625V5.25Z" fill="#FF4A00"/>
        <path d="M8.625 14.25H14.25V18.75H8.625V14.25Z" fill="#FF4A00"/>
        <path d="M15.75 3V7.5H20.25V3C18.2163 3 16.0688 3 15.75 3Z" fill="#FF4A00"/>
        <path d="M15.75 16.5V21H20.25V16.5C18.2163 16.5 16.0688 16.5 15.75 16.5Z" fill="#FF4A00"/>
    </svg>
)

const WhatsAppLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 21.8L7.18 20.45C8.62 21.21 10.28 21.62 12.04 21.62H12.05C17.5 21.62 21.95 17.17 21.95 11.72C21.95 9.12 20.92 6.72 19.16 4.96C17.4 3.2 14.8 2.13 12.04 2.13V2Z" fill="#25D366"/><path d="M9.73 7.95C9.53 7.54 9.32 7.53 9.15 7.53C9.01 7.53 8.81 7.58 8.63 7.75C8.46 7.92 7.93 8.41 7.93 9.33C7.93 10.25 8.66 11.12 8.78 11.27C8.91 11.42 10.27 13.56 12.35 14.38C14.44 15.2 14.44 14.88 14.85 14.84C15.26 14.8 16.14 14.32 16.32 13.84C16.5 13.36 16.5 12.96 16.44 12.83C16.38 12.7 16.23 12.63 16.03 12.51C15.82 12.38 14.89 11.93 14.7 11.85C14.51 11.78 14.36 11.73 14.22 11.93C14.07 12.13 13.66 12.63 13.53 12.78C13.41 12.93 13.28 12.96 13.08 12.83C12.87 12.71 12.08 12.45 11.13 11.6C10.37 10.92 9.89 10.1 9.73 9.83C9.56 9.56 9.68 9.44 9.79 9.33C9.89 9.23 10.02 9.07 10.12 8.95C10.22 8.83 10.27 8.73 10.32 8.63C10.37 8.53 10.32 8.43 10.27 8.35C10.22 8.28 9.92 7.95 9.73 7.95Z" fill="white"/></svg>
)

const MetaLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325V22.676C0 23.407 0.593 24 1.325 24H12.82V14.706H9.692V11.084H12.82V8.413C12.82 5.313 14.713 3.625 17.479 3.625C18.802 3.625 19.922 3.727 20.222 3.775V7.25H18.356C16.852 7.25 16.563 8.013 16.563 8.845V11.084H20.063L19.585 14.706H16.563V24H22.675C23.407 24 24 23.407 24 22.675V1.325C24 0.593 23.407 0 22.675 0Z" fill="#1877F2"/>
    </svg>
)

const GoogleAdsLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.25 2.00006L5.5 6.25006V15.0001L12.25 19.2501L19 15.0001V6.25006L12.25 2.00006Z" fill="#FBBC04"/>
        <path d="M12.25 11.5V19.25L19 15V6.25L12.25 11.5Z" fill="#F29900"/>
        <path d="M5.5 6.25L12.25 11.5L19 6.25L12.25 2L5.5 6.25Z" fill="#FCDA74"/>
        <path d="M11 14L8.5 12.5V9.5L11 8V14Z" fill="#4285F4"/>
        <path d="M11 8L13.5 9.5V12.5L11 14V8Z" fill="#8AB4F8"/>
    </svg>
)


type IntegrationId = 'zapier' | 'email' | 'meta' | 'google-ads' | 'whatsapp';
type Integration = {
    id: IntegrationId;
    name: string;
    description: string;
    logo: JSX.Element;
};

const integrationsData: Integration[] = [
    {
        id: "zapier",
        name: "Zapier",
        description: "Generate a webhook URL to send leads from any Zapier-connected app.",
        logo: <ZapierLogo />,
    },
    {
        id: "whatsapp",
        name: "WhatsApp Business API",
        description: "Connect your WhatsApp Business account using an API key to enable automated messaging workflows.",
        logo: <WhatsAppLogo />,
    },
    {
        id: "email",
        name: "Email Forwarding",
        description: "Generate a unique email address. Any email sent to this address will automatically create a new lead in your CRM.",
        logo: <Mail className="w-10 h-10 text-primary" />,
    },
    {
        id: "meta",
        name: "Meta Ads (Facebook & Instagram)",
        description: "Connect your account to capture leads from your Meta lead forms. This uses a secure OAuth flow to link your accounts.",
        logo: <MetaLogo />,
    },
    {
        id: 'google-ads',
        name: 'Google Ads',
        description: 'Connect Google Ads by generating a unique email. Use this email as the endpoint in your Google Ads Lead Form extensions to automatically capture leads.',
        logo: <GoogleAdsLogo />,
    },
];

type IntegrationSetting = {
    userId: string,
    service: IntegrationId,
    value: string;
    token?: string;
}

export default function IntegrationsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<IntegrationSetting[]>([]);
    const [isLoading, setIsLoading] = useState<Partial<Record<IntegrationId, boolean>>>({});
    const [inputValues, setInputValues] = useState<Partial<Record<IntegrationId, string>>>({});

    useEffect(() => {
        const loadSettings = async () => {
            // In a real app, this would get the current user's ID
            const fetchedSettings = await getIntegrationSettings('user-2');
            setSettings(fetchedSettings);
        }
        loadSettings();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
        });
    }

    const handleConnectToggle = async (id: IntegrationId) => {
        setIsLoading(prev => ({ ...prev, [id]: true }));
        
        const existingSetting = settings.find(s => s.service === id);
        
        try {
            if (existingSetting) { // Disconnect
                await deleteIntegrationSetting('user-2', id);
                setSettings(prev => prev.filter(s => s.service !== id));
                toast({ title: `Integration disconnected.`});
            } else { // Connect
                const userValue = inputValues[id];
                if (id === 'whatsapp' && !userValue) {
                    toast({ title: "API Key Required", description: "Please enter your WhatsApp API key.", variant: "destructive" });
                    setIsLoading(prev => ({ ...prev, [id]: false }));
                    return;
                }

                const newSetting = await createIntegrationSetting('user-2', id, userValue);
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

        if (integration.id === 'meta') {
            return (
                <>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                            Click below to securely connect your Meta account. You will be redirected to Facebook to authorize the connection.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="#" onClick={(e) => {e.preventDefault(); toast({title: "Redirecting to Meta...", description: "This is a simulated OAuth flow."})}}>
                                <ExternalLink className="mr-2" /> Connect with Meta
                            </Link>
                        </Button>
                    </CardFooter>
                </>
            );
        }

        const isGenerated = ['zapier', 'email', 'google-ads'].includes(integration.id);
        
        if (setting) {
            const displayValue = integration.id === 'whatsapp' 
                ? `**********${setting.value.slice(-4)}` 
                : setting.value;

            return (
                 <>
                    <CardContent className="flex-grow">
                        <Label htmlFor={`url-${integration.id}`}>
                            {isGenerated ? 'Your unique address' : 'Your API Key'}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input id={`url-${integration.id}`} readOnly value={displayValue} className="bg-muted" />
                             {isGenerated && (
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(setting.value)}>
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                             )}
                        </div>
                        <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Active and connected.</span>
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={() => handleConnectToggle(integration.id)}
                            variant="destructive"
                            className="w-32"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 
                            <><XCircle className="mr-2"/> Disconnect</>}
                        </Button>
                    </CardFooter>
                </>
            );
        }

        if (isGenerated) {
            return (
                <>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                            Click 'Connect' to generate your unique address.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={() => handleConnectToggle(integration.id)}
                            className="w-32"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" /> Connect</>}
                        </Button>
                    </CardFooter>
                </>
            );
        }

        // Handle API Key input for WhatsApp
        return (
            <>
                <CardContent className="flex-grow">
                    <Label htmlFor={`apikey-${integration.id}`}>Your API Key</Label>
                    <Input 
                        id={`apikey-${integration.id}`}
                        type="password"
                        placeholder="Enter your API key"
                        className="mt-1"
                        value={inputValues[integration.id] || ''}
                        onChange={(e) => setInputValues(prev => ({...prev, [integration.id]: e.target.value}))}
                    />
                </CardContent>
                <CardFooter>
                     <Button 
                        onClick={() => handleConnectToggle(integration.id)}
                        className="w-32"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" /> Connect</>}
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
