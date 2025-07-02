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


type IntegrationId = 'zapier' | 'email' | 'meta' | 'google-ads';
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
    service: IntegrationId,
    value: string;
}

export default function IntegrationsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<IntegrationSetting[]>([]);
    const [isLoading, setIsLoading] = useState<Partial<Record<IntegrationId, boolean>>>({});

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
                const newSetting = await createIntegrationSetting('user-2', id);
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
        
        if (setting) {
            return (
                 <>
                    <CardContent className="flex-grow">
                        <Label htmlFor={`url-${integration.id}`}>Your unique {integration.id === 'zapier' ? 'webhook URL' : 'email address'}</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input id={`url-${integration.id}`} readOnly value={setting.value} className="bg-muted" />
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(setting.value)}>
                                <ClipboardCopy className="h-4 w-4" />
                            </Button>
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

        return (
            <>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                        {integration.id === 'zapier' ? 'Generate a webhook URL to receive leads.' : 'Generate a unique email to forward leads to.'}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={() => handleConnectToggle(integration.id)}
                        className="w-32"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 
                        <><CheckCircle className="mr-2" /> Connect</>}
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
