import type { AdminAuditLogsProps } from '@/types';

export default function AdminAuditLogs({ auditLogs }: AdminAuditLogsProps) {
    return (
        <div>
            <h1>Admin Audit Logs</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Admin</th>
                        <th>Activity</th>
                        <th>Module</th>
                        <th>Message</th>
                        <th>Target Type</th>
                        <th>Target ID</th>
                        <th>IP Address</th>
                        <th>Date/Time</th>
                    </tr>
                </thead>
                <tbody>
                    {auditLogs.length === 0 ? (
                        <tr>
                            <td colSpan={9}>No audit logs found.</td>
                        </tr>
                    ) : (
                        auditLogs.map((log) => (
                            <tr key={log.id}>
                                <td>{log.id}</td>
                                <td>
                                    <div>{log.admin_name}</div>
                                    <div>{log.admin_email}</div>
                                </td>
                                <td>{log.activityTitle}</td>
                                <td>{log.moduleType}</td>
                                <td>{log.message}</td>
                                <td>{log.targetType || '-'}</td>
                                <td>{log.targetId || '-'}</td>
                                <td>{log.ipAddress || '-'}</td>
                                <td>{log.created_at}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
