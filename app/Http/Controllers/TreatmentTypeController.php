<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTreatmentTypeRequest;
use App\Models\TreatmentType;
use Inertia\Inertia;

class TreatmentTypeController extends Controller
{
    public function index()
    {
        $treatmentTypes = TreatmentType::all();

        return Inertia::render('TreatmentTypesTable', [
            'treatmentTypes' => $treatmentTypes,
        ]);
    }

    public function create()
    {
        return Inertia::render('AddTreatmentType');
    }

    public function store(StoreTreatmentTypeRequest $request)
    {
        $validated = $request->validated();

        TreatmentType::create($validated);

        return redirect()->route('admin.treatment-types.index')
            ->with('success', 'Treatment type added successfully!');
    }
}
