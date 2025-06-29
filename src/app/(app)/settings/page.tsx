import { getCustomFields, getWorkflows, getPipelineStages, getUsers } from '@/lib/data'
import { SettingsView } from '@/components/settings/settings-view'

export default async function SettingsPage() {
    const [customFields, pipelineStages, workflowRules, userList] = await Promise.all([
        getCustomFields(),
        getPipelineStages(),
        getWorkflows(),
        getUsers()
    ]);

    const users = userList.filter(u => u.role === 'Counselor' || u.role === 'Receptionist');

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your CRM settings, customizations, and automations.</p>
            </div>

            <SettingsView
                initialFields={customFields}
                initialStages={pipelineStages}
                initialWorkflows={workflowRules}
                users={users}
            />
        </div>
    )
}
