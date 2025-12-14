<?php

namespace App\Http\Controllers;

use App\Enums\AuditModuleType;
use App\Enums\AuditTargetType;
use App\Http\Requests\StoreSpecializationRequest;
use App\Models\Specialization;
use App\Services\AdminAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SpecializationController extends Controller
{
    public function __construct(
        protected AdminAuditService $auditService
    ) {}

    public function index()
    {
        $specializations = Specialization::all();

        return Inertia::render('admin/SpecializationsTable', [
            'specializations' => $specializations,
        ]);
    }

    public function store(StoreSpecializationRequest $request)
    {
        $validated = $request->validated();

        $specializations = collect($validated['names'])->map(fn($name) => [
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        Specialization::insert($specializations);

        // Audit log for each specialization created
        foreach ($validated['names'] as $name) {
            $this->auditService->log(
                adminId: Auth::id(),
                activityTitle: 'Specialization Created',
                message: "Created specialization: {$name}",
                moduleType: AuditModuleType::SERVICES_MANAGEMENT,
                targetType: AuditTargetType::SPECIALIZATION,
                targetId: null,
                newValue: ['name' => $name]
            );
        }

        return redirect()->route('admin.specializations.index')
            ->with('success', 'Specializations added successfully!');
    }

    public function update(Request $request, Specialization $specialization)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specializations,name,' . $specialization->id,
        ]);

        $oldName = $specialization->name;
        $specialization->update($validated);

        // Audit log
        $this->auditService->log(
            adminId: Auth::id(),
            activityTitle: 'Specialization Updated',
            message: "Updated specialization from '{$oldName}' to '{$validated['name']}'",
            moduleType: AuditModuleType::SERVICES_MANAGEMENT,
            targetType: AuditTargetType::SPECIALIZATION,
            targetId: $specialization->id,
            oldValue: ['name' => $oldName],
            newValue: ['name' => $validated['name']]
        );

        return back()->with('success', 'Specialization updated successfully!');
    }

    public function destroy(Specialization $specialization)
    {
        // Check if any dentists have this specialization
        if ($specialization->dentists()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete specialization that is assigned to dentists.']);
        }

        $deletedData = ['id' => $specialization->id, 'name' => $specialization->name];
        $specialization->delete();

        // Audit log
        $this->auditService->log(
            adminId: Auth::id(),
            activityTitle: 'Specialization Deleted',
            message: "Deleted specialization: {$deletedData['name']}",
            moduleType: AuditModuleType::SERVICES_MANAGEMENT,
            targetType: AuditTargetType::SPECIALIZATION,
            targetId: $deletedData['id'],
            oldValue: $deletedData
        );

        return back()->with('success', 'Specialization deleted successfully!');
    }
}
