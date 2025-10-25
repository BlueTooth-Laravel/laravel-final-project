<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    // If your primary key is 'specialization_id', specify it
    protected $primaryKey = 'specialization_id';

    // Table name (optional if following Laravel conventions: plural, i.e., 'specializations')
    protected $table = 'specializations';

    // Fillable fields for mass assignment
    protected $fillable = [
        'specialization_name',
    ];

    // One-to-many relationship: One specialization has many dentists
    public function dentists()
    {
        return $this->belongsToMany(Dentist::class, 'dentist_specialization', 'specialization_id', 'dentist_id');
    }
}
