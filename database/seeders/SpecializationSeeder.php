<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecializationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('specializations')->upsert([
            ['name' => 'General Dentistry'],
            ['name' => 'Orthodontics'],
            ['name' => 'Oral Surgery'],
            ['name' => 'Periodontics'],
            ['name' => 'Endodontics'],
            ['name' => 'Pediatric Dentistry'],
            ['name' => 'Prosthodontics'],
        ], ['name']);
    }
}
