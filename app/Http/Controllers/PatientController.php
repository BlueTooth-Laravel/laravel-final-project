<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Models\Patient;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::all();

        return Inertia::render('PatientsTable', [
            'patients' => $patients,
        ]);
    }

    public function create()
    {
        return Inertia::render('RegisterPatient');
    }

    public function store(StorePatientRequest $request)
    {
        $validated = $request->validated();

        Patient::create($validated);

        return redirect()->route('patients.index')
            ->with('success', 'Patient added successfully!');
    }
}
