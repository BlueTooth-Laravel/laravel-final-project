<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class DentistController extends Controller
{
    public function index()
    {
        // Eloquent: filter dentists by role and eager-load their specializations
        $dentists = User::with('specializations:id,name')
            ->dentists()
            ->get(['id', 'fname', 'mname', 'lname', 'contact_number', 'email'])
            ->map(function ($u) {
                return [
                    'dentist_id' => $u->id,
                    'fname' => $u->fname,
                    'mname' => $u->mname,
                    'lname' => $u->lname,
                    'specialization' => $u->specializations->pluck('name')->join(', '),
                    'contact_number' => $u->contact_number,
                    'email' => $u->email,
                ];
            });

        return Inertia::render('DentistsTable', [
            'dentists' => $dentists,
        ]);
    }
}
