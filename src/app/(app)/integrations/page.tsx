import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare } from "lucide-react";

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


export default function IntegrationsPage() {
    const integrations = [
        {
            name: "Zapier",
            description: "Connect LeadFlow to thousands of other apps with Zapier.",
            logo: <ZapierLogo />,
            apiKeyLabel: "Zapier Webhook URL",
            placeholder: "https://hooks.zapier.com/hooks/catch/..."
        },
        {
            name: "Email Forwarding",
            description: "Automatically create leads from emails sent to a specific address.",
            logo: <Mail className="w-10 h-10 text-primary" />,
            apiKeyLabel: "Forwarding Email Address",
            placeholder: "leads@your-domain.leadflow.io",
            isInput: false,
        },
        {
            name: "WhatsApp Business",
            description: "Engage with leads and automate messages via WhatsApp.",
            logo: <WhatsAppLogo />,
            apiKeyLabel: "WhatsApp API Key",
            placeholder: "Enter your WhatsApp Business API Key"
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect your favorite tools to supercharge your lead management workflow.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {integrations.map(integration => (
                     <Card key={integration.name}>
                        <CardHeader className="flex flex-row items-start gap-4">
                            {integration.logo}
                            <div>
                                <CardTitle>{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor={`api-key-${integration.name}`}>{integration.apiKeyLabel}</Label>
                                {integration.isInput === false ? (
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-mono p-2 bg-muted rounded-md flex-1">
                                            {integration.placeholder}
                                        </p>
                                        <Button variant="outline" size="sm">Copy</Button>
                                    </div>
                                ) : (
                                     <Input id={`api-key-${integration.name}`} placeholder={integration.placeholder} />
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                             <Button>Connect</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
