<?php

namespace App\Http\Controllers;

use App\Models\Dentist;
use Illuminate\Http\Request;

class DentistController extends Controller
{
    public function index()
    {
        $dentists = Dentist::all();
        return response()->json($dentists);
    }
}
