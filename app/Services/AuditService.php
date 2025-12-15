<?php

namespace App\Services;

use App\Models\AdminAudit;
use App\Models\Appointment;
use Illuminate\Support\Collection;

class AuditService
{
    /**
     * Search audit logs for a specific target (appointment, patient, dentist, etc.)
     *
     * @param string $targetType The type of target (appointment, patient, dentist)
     * @param int|null $targetId The ID of the target
     * @param string|null $action Filter by action (created, updated, deleted)
     * @return array
     */
    public function searchAuditLogs(string $targetType, ?int $targetId = null, ?string $action = null): array
    {
        $query = AdminAudit::with('admin')
            ->where('targetType', $targetType)
            ->orderBy('created_at', 'desc')
            ->limit(10);

        if ($targetId) {
            $query->where('targetId', $targetId);
        }

        if ($action) {
            $query->where('activityTitle', 'like', "%{$action}%");
        }

        $logs = $query->get();

        if ($logs->isEmpty()) {
            return [
                'found' => false,
                'message' => "No audit logs found for {$targetType}" . ($targetId ? " with ID {$targetId}" : "") . ".",
            ];
        }

        return [
            'found' => true,
            'count' => $logs->count(),
            'logs' => $logs->map(function ($log) {
                return [
                    'action' => $log->activityTitle,
                    'performed_by' => $log->admin?->name ?? 'Unknown User',
                    'message' => $log->message,
                    'date' => $log->created_at->format('M j, Y g:i A'),
                    'target_id' => $log->targetId,
                ];
            })->toArray(),
        ];
    }

    /**
     * Find who created a specific appointment by appointment ID or patient name.
     *
     * @param int|null $appointmentId
     * @param string|null $patientName
     * @return array
     */
    public function findAppointmentCreator(?int $appointmentId = null, ?string $patientName = null): array
    {
        // If patient name is provided, find the appointment first
        if ($patientName && !$appointmentId) {
            $searchTerm = '%' . strtolower($patientName) . '%';
            
            $appointment = Appointment::query()
                ->whereHas('patient', function ($q) use ($searchTerm) {
                    $q->whereRaw("CONCAT_WS(' ', LOWER(fname), NULLIF(LOWER(mname), ''), LOWER(lname)) LIKE ?", [$searchTerm])
                        ->orWhereRaw("CONCAT(LOWER(fname), ' ', LOWER(lname)) LIKE ?", [$searchTerm]);
                })
                ->with('patient')
                ->latest('created_at')
                ->first();

            if (!$appointment) {
                return [
                    'found' => false,
                    'message' => "No appointments found for patient matching '{$patientName}'.",
                ];
            }

            $appointmentId = $appointment->id;
        }

        if (!$appointmentId) {
            return ['error' => 'Either appointment ID or patient name is required.'];
        }

        // Find the creation audit log
        $createLog = AdminAudit::with('admin')
            ->where('targetType', 'appointment')
            ->where('targetId', $appointmentId)
            ->where(function ($q) {
                $q->where('activityTitle', 'like', '%Created%')
                    ->orWhere('activityTitle', 'like', '%Create%')
                    ->orWhere('activityTitle', 'like', '%created%');
            })
            ->orderBy('created_at', 'asc')
            ->first();

        if (!$createLog) {
            return [
                'found' => false,
                'message' => "No creation record found for appointment ID {$appointmentId}. The appointment may have been created before audit logging was enabled.",
            ];
        }

        // Get appointment details
        $appointment = Appointment::with(['patient', 'dentist'])->find($appointmentId);

        return [
            'found' => true,
            'appointment_id' => $appointmentId,
            'patient_name' => $appointment?->patient?->name ?? 'Unknown',
            'created_by' => $createLog->admin?->name ?? 'Unknown User',
            'created_at' => $createLog->created_at->format('M j, Y g:i A'),
            'message' => $createLog->message,
        ];
    }

    /**
     * Get recent activity for a specific module.
     *
     * @param string $moduleType
     * @param int $limit
     * @return array
     */
    public function getRecentActivity(string $moduleType, int $limit = 10): array
    {
        $logs = AdminAudit::with('admin')
            ->where('moduleType', $moduleType)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        if ($logs->isEmpty()) {
            return [
                'found' => false,
                'message' => "No recent activity found for {$moduleType}.",
            ];
        }

        return [
            'found' => true,
            'count' => $logs->count(),
            'activity' => $logs->map(function ($log) {
                return [
                    'action' => $log->activityTitle,
                    'performed_by' => $log->admin?->name ?? 'Unknown User',
                    'message' => $log->message,
                    'date' => $log->created_at->format('M j, Y g:i A'),
                ];
            })->toArray(),
        ];
    }

    /**
     * Find who created any entity (user, dentist, admin, patient, appointment, etc.) by name.
     * This is a general-purpose function that searches audit logs by message content.
     *
     * @param string $entityName The name of the entity to search for
     * @return array
     */
    public function findEntityCreator(string $entityName): array
    {
        $searchTerm = '%' . strtolower($entityName) . '%';
        
        // Search for creation audit logs that mention this name in the message
        $createLog = AdminAudit::with('admin')
            ->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(message) LIKE ?', [$searchTerm]);
            })
            ->where(function ($q) {
                $q->where('activityTitle', 'like', '%Created%')
                    ->orWhere('activityTitle', 'like', '%Create%')
                    ->orWhere('activityTitle', 'like', '%created%');
            })
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$createLog) {
            // Try to find any audit log mentioning this name
            $anyLog = AdminAudit::with('admin')
                ->whereRaw('LOWER(message) LIKE ?', [$searchTerm])
                ->orderBy('created_at', 'desc')
                ->first();

            if ($anyLog) {
                return [
                    'found' => true,
                    'note' => 'No creation record found, but found other activity for this entity.',
                    'action' => $anyLog->activityTitle,
                    'performed_by' => $anyLog->admin?->name ?? 'Unknown User',
                    'message' => $anyLog->message,
                    'target_type' => $anyLog->targetType,
                    'date' => $anyLog->created_at->format('M j, Y g:i A'),
                ];
            }

            return [
                'found' => false,
                'message' => "No audit logs found mentioning '{$entityName}'. The entity may have been created before audit logging was enabled.",
            ];
        }

        return [
            'found' => true,
            'action' => $createLog->activityTitle,
            'created_by' => $createLog->admin?->name ?? 'Unknown User',
            'message' => $createLog->message,
            'target_type' => $createLog->targetType,
            'target_id' => $createLog->targetId,
            'created_at' => $createLog->created_at->format('M j, Y g:i A'),
        ];
    }

    /**
     * Search audit logs by activity title, module type, or action keywords.
     * This is useful for questions like "who removed the clinic availability?"
     *
     * @param string|null $activity Activity title keyword (e.g., "Removed", "Created", "Updated")
     * @param string|null $moduleType Module type (e.g., "clinic-management", "appointment-management")
     * @param string|null $keyword Keyword to search in message or activity title
     * @return array
     */
    public function searchByActivity(?string $activity = null, ?string $moduleType = null, ?string $keyword = null): array
    {
        $query = AdminAudit::with('admin')
            ->orderBy('created_at', 'desc')
            ->limit(10);

        if ($activity) {
            // PostgreSQL requires quoted column names for camelCase
            $query->whereRaw('"activityTitle" ILIKE ?', ["%{$activity}%"]);
        }

        if ($moduleType) {
            // Normalize common module names
            $normalizedModule = strtolower(str_replace(' ', '-', $moduleType));
            $query->whereRaw('"moduleType" ILIKE ?', ["%{$normalizedModule}%"]);
        }

        if ($keyword) {
            $searchTerm = "%{$keyword}%";
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('"message" ILIKE ?', [$searchTerm])
                    ->orWhereRaw('"activityTitle" ILIKE ?', [$searchTerm]);
            });
        }

        $logs = $query->get();

        if ($logs->isEmpty()) {
            $searchDesc = [];
            if ($activity) $searchDesc[] = "activity '{$activity}'";
            if ($moduleType) $searchDesc[] = "module '{$moduleType}'";
            if ($keyword) $searchDesc[] = "keyword '{$keyword}'";
            
            return [
                'found' => false,
                'message' => "No audit logs found for " . implode(' and ', $searchDesc) . ".",
            ];
        }

        return [
            'found' => true,
            'count' => $logs->count(),
            'logs' => $logs->map(function ($log) {
                return [
                    'action' => $log->activityTitle,
                    'performed_by' => $log->admin?->name ?? 'Unknown User',
                    'role' => $log->admin?->role_id === 1 ? 'Admin' : ($log->admin?->role_id === 2 ? 'Dentist' : 'Unknown'),
                    'message' => $log->message,
                    'module' => $log->moduleType,
                    'date' => $log->created_at->format('M j, Y g:i A'),
                ];
            })->toArray(),
        ];
    }
}
