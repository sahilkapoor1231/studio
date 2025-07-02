'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";

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
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.354 14.994C16.138 15.43 15.171 15.938 14.73 16.154C14.289 16.37 13.689 16.429 13.165 16.271C12.642 16.113 11.438 15.688 10.227 14.63C8.705 13.292 7.84 11.662 7.682 11.381C7.524 11.1 6.924 10.133 6.924 9.248C6.924 8.363 7.359 7.925 7.575 7.709C7.791 7.493 8.148 7.394 8.429 7.394C8.71 7.394 8.931 7.424 9.117 7.454C9.363 7.499 9.549 8.213 9.69 8.429C9.831 8.645 9.89 8.926 9.779 9.142C9.668 9.358 9.579 9.479 9.421 9.665C9.263 9.851 9.105 10.008 9.246 10.28C9.387 10.552 9.894 11.309 10.68 12.006C11.631 12.868 12.328 13.129 12.574 13.27C12.82 13.411 13.066 13.381 13.252 13.165C13.438 12.949 13.842 12.441 14.152 12.071C14.462 11.701 14.767 11.642 15.108 11.783C15.449 11.924 16.163 12.293 16.379 12.42C16.595 12.547 16.736 12.606 16.795 12.747C16.854 12.888 16.854 13.287 16.705 13.559C16.556 13.831 16.57 14.558 16.354 14.994Z"/>
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

const MailchimpLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.29 11.22L13.81 14.7C13.42 15.09 12.79 15.09 12.4 14.7L10.38 12.68L8.29 14.77C7.9 15.16 7.27 15.16 6.88 14.77C6.49 14.38 6.49 13.75 6.88 13.36L9.61 10.63L6.88 7.9C6.49 7.51 6.49 6.88 6.88 6.49C7.27 6.1 7.9 6.1 8.29 6.49L10.42 8.62L12.4 6.64C12.79 6.25 13.42 6.25 13.81 6.64C14.2 7.03 14.2 7.66 13.81 8.05L11.83 10.03L13.81 11.99L17.29 8.51C17.68 8.12 18.31 8.12 18.7 8.51C19.09 8.9 19.09 9.53 18.7 9.92L17.29 11.22Z" fill="#FFE01B"/>
    </svg>
)

type Integration = {
    id: 'zapier' | 'email' | 'whatsapp' | 'meta' | 'google-ads' | 'mailchimp';
    name: string;
    description: string;
    logo: JSX.Element;
    apiKeyLabel: string;
    placeholder: string;
    isInput: boolean;
};

const integrationsData: Integration[] = [
    {
        id: "zapier",
        name: "Zapier",
        description: "Connect LeadFlow to thousands of other apps with Zapier.",
        logo: <ZapierLogo />,
        apiKeyLabel: "Zapier Webhook URL",
        placeholder: "https://hooks.zapier.com/hooks/catch/...",
        isInput: true,
    },
    {
        id: "email",
        name: "Email Forwarding",
        description: "Set up a secret forwarding address to create leads from emails.",
        logo: <Mail className="w-10 h-10 text-primary" />,
        apiKeyLabel: "Forwarding Email Address",
        placeholder: "your-secret-forwarding-address@leadflow.app",
        isInput: true,
    },
    {
        id: "whatsapp",
        name: "WhatsApp Business",
        description: "Engage with leads and automate messages via WhatsApp.",
        logo: <WhatsAppLogo />,
        apiKeyLabel: "WhatsApp API Key",
        placeholder: "Enter your WhatsApp Business API Key",
        isInput: true,
    },
    {
        id: "meta",
        name: "Meta Ads (Facebook & Instagram)",
        description: "Enter your webhook token to capture leads from your Meta lead forms.",
        logo: <MetaLogo />,
        apiKeyLabel: "Meta API Access Token",
        placeholder: "Enter your Meta API Access Token",
        isInput: true,
    },
    {
        id: 'google-ads',
        name: 'Google Ads',
        description: 'Forward leads from Google Ads to a unique email address.',
        logo: <GoogleAdsLogo />,
        apiKeyLabel: 'Forwarding Email Address',
        placeholder: 'your-gads-forwarding-address@leadflow.app',
        isInput: true,
    },
    {
        id: 'mailchimp',
        name: 'Mailchimp',
        description: 'Sync leads to your Mailchimp audiences for marketing campaigns.',
        logo: <MailchimpLogo />,
        apiKeyLabel: 'Mailchimp API Key',
        placeholder: 'Enter your Mailchimp API Key',
        isInput: true,
    }
];

type IntegrationState = {
    [key in Integration['id']]: {
        apiKey: string;
        connected: boolean;
    }
}

export default function IntegrationsPage() {
    const { toast } = useToast();
    const [integrationState, setIntegrationState] = useState<IntegrationState>({
        zapier: { apiKey: '', connected: false },
        email: { apiKey: '', connected: false },
        whatsapp: { apiKey: '', connected: false },
        meta: { apiKey: '', connected: false },
        'google-ads': { apiKey: '', connected: false },
        mailchimp: { apiKey: '', connected: false },
    });
    const [isLoading, setIsLoading] = useState<Partial<Record<Integration['id'], boolean>>>({});

    const handleApiKeyChange = (id: Integration['id'], value: string) => {
        setIntegrationState(prev => ({ ...prev, [id]: { ...prev[id], apiKey: value }}));
    };

    const handleConnectToggle = async (id: Integration['id']) => {
        setIsLoading(prev => ({ ...prev, [id]: true }));
        
        const isConnecting = !integrationState[id].connected;
        const apiKey = integrationState[id].apiKey;

        if (isConnecting && !apiKey) {
            toast({
                title: "API Key Required",
                description: "Please enter an API key to connect.",
                variant: "destructive",
            });
            setIsLoading(prev => ({ ...prev, [id]: false }));
            return;
        }

        try {
            const response = await fetch('/api/integrations/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service: id,
                    apiKey: isConnecting ? apiKey : '', // Send empty key on disconnect
                    connect: isConnecting,
                }),
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update integration status');
            }
            
            setIntegrationState(prev => ({
                ...prev,
                [id]: { ...prev[id], connected: isConnecting, apiKey: isConnecting ? apiKey : '' }
            }));

            toast({
                title: `Integration ${isConnecting ? 'Connected' : 'Disconnected'}`,
                description: `${integrationsData.find(i => i.id === id)?.name} has been successfully ${isConnecting ? 'connected' : 'disconnected'}.`
            });

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect your favorite tools to supercharge your lead management workflow.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {integrationsData.map(integration => {
                    const state = integrationState[integration.id];
                    const loading = isLoading[integration.id];
                    return (
                        <Card key={integration.name} className="flex flex-col">
                            <CardHeader className="flex flex-row items-start gap-4">
                                {integration.logo}
                                <div>
                                    <CardTitle>{integration.name}</CardTitle>
                                    <CardDescription>{integration.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="space-y-2">
                                    <Label htmlFor={`api-key-${integration.name}`}>{integration.apiKeyLabel}</Label>
                                    <Input 
                                        id={`api-key-${integration.name}`} 
                                        placeholder={integration.placeholder} 
                                        value={state.apiKey}
                                        onChange={(e) => handleApiKeyChange(integration.id, e.target.value)}
                                        disabled={state.connected || loading}
                                    />
                                </div>
                                {state.connected && (
                                     <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Active and connected.</span>
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    onClick={() => handleConnectToggle(integration.id)}
                                    variant={state.connected ? "destructive" : "default"}
                                    className="w-32"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 
                                    state.connected ? <><XCircle className="mr-2"/> Disconnect</> : 
                                    <><CheckCircle className="mr-2" /> Connect</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
