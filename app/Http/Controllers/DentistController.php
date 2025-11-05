<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Specialization;
use App\Services\DentistService;
use App\Http\Requests\StoreDentistRequest;
use Inertia\Inertia;

class DentistController extends Controller
{
    protected $dentistService;

    public function __construct(DentistService $dentistService)
    {
        $this->dentistService = $dentistService;
    }

    /**
     * Display a listing of dentists.
     */
    public function index()
    {
        // Get all users with dentist role (role_id = 2)
        $dentists = User::where('role_id', 2)
            ->with(['dentistProfile', 'specializations'])
            ->get()
            ->map(function ($dentist) {
                $profile = $dentist->dentistProfile;

                return [
                    'dentist_id' => $dentist->id,
                    'fname' => $dentist->fname,
                    'mname' => $dentist->mname,
                    'lname' => $dentist->lname,
                    'specialization' => $dentist->specializations->pluck('name')->join(', '),
                    'contact_number' => $dentist->contact_number,
                    'email' => $dentist->email,
                    'employment_status' => $profile?->employment_status,
                    'hire_date' => $profile?->hire_date?->format('Y-m-d'),
                ];
            });

        return Inertia::render('DentistsTable', [
            'dentists' => $dentists,
        ]);
    }

    /**
     * Show the form for creating a new dentist.
     * Only admins can access this.
     */
    public function create()
    {
        // Get all available specializations
        $specializations = Specialization::all()->map(function ($spec) {
            return [
                'id' => $spec->id,
                'name' => $spec->name,
            ];
        });

        return Inertia::render('RegisterDentist', [
            'specializations' => $specializations,
        ]);
    }

    /**
     * Store a newly created dentist.
     * Only admins can create dentists.
     */
    public function store(StoreDentistRequest $request)
    {
        try {
            // Get validated data from the Form Request
            $validated = $request->validated();

            // Use the service to create the dentist
            $dentist = $this->dentistService->createDentist($validated);

            // Log admin activity
            /** @var \App\Models\User $user */
            $user = $request->user();
            $this->dentistService->logDentistCreated(
                $user->id,
                $dentist
            );

            return redirect()->route('dentists.index')
                ->with('success', 'Dentist registered successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to register dentist: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Display the specified dentist.
     * 
     * @param User $dentist
     * @return \Inertia\Response
     */
    public function show(User $dentist)
    {
        // Ensure the user is a dentist
        if ($dentist->role_id !== 2) {
            abort(404, 'Dentist not found.');
        }

        // Load relationships
        $dentist->load(['dentistProfile', 'specializations']);

        // Format the dentist data
        $dentistData = [
            'id' => $dentist->id,
            'fname' => $dentist->fname,
            'mname' => $dentist->mname,
            'lname' => $dentist->lname,
            'full_name' => trim($dentist->fname . ' ' . ($dentist->mname ? $dentist->mname . ' ' : '') . $dentist->lname),
            'gender' => $dentist->gender,
            'email' => $dentist->email,
            'contact_number' => $dentist->contact_number,
            'avatar_path' => $dentist->avatar_path,
            'avatar_url' => $dentist->avatar_path ? asset('storage/' . $dentist->avatar_path) : null,
            'specializations' => $dentist->specializations->map(function ($spec) {
                return [
                    'id' => $spec->id,
                    'name' => $spec->name,
                ];
            }),
            'employment_status' => $dentist->dentistProfile?->employment_status,
            'hire_date' => $dentist->dentistProfile?->hire_date?->format('Y-m-d'),
            'hire_date_formatted' => $dentist->dentistProfile?->hire_date?->format('F d, Y'),
            'archived_at' => $dentist->dentistProfile?->archived_at,
            'created_at' => $dentist->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $dentist->created_at->format('F d, Y'),
            'email_verified_at' => $dentist->email_verified_at,
            'must_change_password' => $dentist->must_change_password,
        ];

        return Inertia::render('ViewDentist', [
            'dentist' => $dentistData,
        ]);
    }
}
