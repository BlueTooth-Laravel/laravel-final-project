<?php

namespace App\Http\Controllers;

use App\Enums\AuditModuleType;
use App\Enums\AuditTargetType;
use App\Models\ClinicAvailability;
use App\Models\ClinicClosureException;
use App\Services\AdminAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClinicAvailabilityController extends Controller
{
    public function __construct(
        protected AdminAuditService $auditService
    ) {}

    /**
     * Display the clinic availability management page.
     */
    public function index()
    {
        // Get all weekly availability settings
        $availabilities = ClinicAvailability::orderBy('day_of_week')
            ->get()
            ->map(function ($avail) {
                return [
                    'id' => $avail->id,
                    'day_of_week' => $avail->day_of_week,
                    'day_name' => $avail->day_name,
                    'open_time' => $avail->open_time ? substr($avail->open_time, 0, 5) : null,
                    'close_time' => $avail->close_time ? substr($avail->close_time, 0, 5) : null,
                    'is_closed' => $avail->is_closed,
                ];
            });

        // Get closure exceptions (upcoming and recent)
        $closures = ClinicClosureException::where('date', '>=', now()->subMonth())
            ->orderBy('date')
            ->get()
            ->map(function ($closure) {
                return [
                    'id' => $closure->id,
                    'date' => $closure->date->format('Y-m-d'),
                    'reason' => $closure->reason,
                    'is_closed' => $closure->is_closed,
                ];
            });

        return Inertia::render('admin/ClinicAvailability', [
            'availabilities' => $availabilities,
            'closures' => $closures,
        ]);
    }

    /**
     * Store or update clinic availability for a day of the week.
     */
    public function storeOrUpdate(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:1', 'max:7'],
            'open_time' => ['required_if:is_closed,false', 'nullable', 'date_format:H:i'],
            'close_time' => ['required_if:is_closed,false', 'nullable', 'date_format:H:i', 'after:open_time'],
            'is_closed' => ['boolean'],
        ], [
            'close_time.after' => 'Close time must be after open time.',
        ]);

        // Check if record exists for old value capture
        $existingAvailability = ClinicAvailability::where('day_of_week', $validated['day_of_week'])->first();
        $oldData = $existingAvailability ? [
            'open_time' => $existingAvailability->open_time,
            'close_time' => $existingAvailability->close_time,
            'is_closed' => $existingAvailability->is_closed,
        ] : null;

        $availability = ClinicAvailability::updateOrCreate(
            ['day_of_week' => $validated['day_of_week']],
            [
                'open_time' => $validated['is_closed'] ? null : $validated['open_time'],
                'close_time' => $validated['is_closed'] ? null : $validated['close_time'],
                'is_closed' => $validated['is_closed'] ?? false,
            ]
        );

        $dayName = $availability->day_name;

        // Audit log
        $this->auditService->log(
            adminId: Auth::id(),
            activityTitle: $oldData ? 'Clinic Availability Updated' : 'Clinic Availability Created',
            message: "Updated availability for {$dayName}",
            moduleType: AuditModuleType::CLINIC_MANAGEMENT,
            targetType: AuditTargetType::CLINIC_AVAILABILITY,
            targetId: $availability->id,
            oldValue: $oldData,
            newValue: [
                'day_name' => $dayName,
                'open_time' => $availability->open_time,
                'close_time' => $availability->close_time,
                'is_closed' => $availability->is_closed,
            ]
        );

        return back()->with('success', "Availability for {$dayName} updated successfully.");
    }

    /**
     * Remove clinic availability for a day.
     */
    public function destroy(ClinicAvailability $clinicAvailability)
    {
        $dayName = $clinicAvailability->day_name;
        $deletedData = [
            'id' => $clinicAvailability->id,
            'day_name' => $dayName,
            'open_time' => $clinicAvailability->open_time,
            'close_time' => $clinicAvailability->close_time,
            'is_closed' => $clinicAvailability->is_closed,
        ];

        $clinicAvailability->delete();

        // Audit log
        $this->auditService->log(
            adminId: Auth::id(),
            activityTitle: 'Clinic Availability Removed',
            message: "Removed availability for {$dayName}",
            moduleType: AuditModuleType::CLINIC_MANAGEMENT,
            targetType: AuditTargetType::CLINIC_AVAILABILITY,
            targetId: $deletedData['id'],
            oldValue: $deletedData
        );

        return back()->with('success', "Availability for {$dayName} removed successfully.");
    }

    /**
     * Store a new closure exception (holiday, special closure).
     */
    public function storeClosure(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today', 'unique:clinic_closure_exceptions,date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'is_closed' => ['boolean'],
        ], [
            'date.unique' => 'A closure exception already exists for this date.',
        ]);

        $closure = ClinicClosureException::create([
            'date' => $validated['date'],
            'reason' => $validated['reason'] ?? null,
            'is_closed' => $validated['is_closed'] ?? true,
        ]);

        // Audit log
        $this->auditService->log(
            adminId: Auth::id(),
            activityTitle: 'Closure Exception Added',
            message: "Added closure exception for {$validated['date']}",
            moduleType: AuditModuleType::CLINIC_MANAGEMENT,
            targetType: AuditTargetType::CLOSURE_EXCEPTION,
            targetId: $closure->id,
            newValue: [
                'date' => $validated['date'],
                'reason' => $validated['reason'] ?? null,
                'is_closed' => $validated['is_closed'] ?? true,
            ]
        );

        return back()->with('success', 'Closure exception added successfully.');
    }

    /**
     * Remove a closure exception.
     */
    public function destroyClosure(ClinicClosureException $closure)
    {
        $deletedData = [
            'id' => $closure->id,
            'date' => $closure->date->format('Y-m-d'),
            'reason' => $closure->reason,
            'is_closed' => $closure->is_closed,
        ];

        $closure->delete();

        // Audit log
        $this->auditService->log(
            adminId: Auth::id(),
            activityTitle: 'Closure Exception Removed',
            message: "Removed closure exception for {$deletedData['date']}",
            moduleType: AuditModuleType::CLINIC_MANAGEMENT,
            targetType: AuditTargetType::CLOSURE_EXCEPTION,
            targetId: $deletedData['id'],
            oldValue: $deletedData
        );

        return back()->with('success', 'Closure exception removed successfully.');
    }
}
