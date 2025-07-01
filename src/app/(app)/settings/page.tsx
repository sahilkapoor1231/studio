import { SettingsView } from '@/components/settings/settings-view'

export default async function SettingsPage() {
    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your CRM settings, customizations, and automations.</p>
            </div>
            <SettingsView />
        </div>
    )
}
