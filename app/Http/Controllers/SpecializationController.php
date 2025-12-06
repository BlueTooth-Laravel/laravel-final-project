<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpecializationRequest;
use App\Models\Specialization;
use Inertia\Inertia;

class SpecializationController extends Controller
{
    public function index()
    {
        $specializations = Specialization::all();

        return Inertia::render('SpecializationsTable', [
            'specializations' => $specializations,
        ]);
    }

    public function create()
    {
        return Inertia::render('AddSpecialization');
    }

    public function store(StoreSpecializationRequest $request)
    {
        $validated = $request->validated();

        Specialization::create($validated);

        return redirect()->route('admin.specializations.index')
            ->with('success', 'Specialization added successfully!');
    }
}
