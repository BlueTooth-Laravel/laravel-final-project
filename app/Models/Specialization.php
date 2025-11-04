<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    // Using Laravel defaults: primary key 'id', table 'specializations'
    protected $fillable = [
        'name',
    ];

    // Many-to-many relationship: specialization belongs to many users (dentists)
    public function dentists()
    {
        return $this->belongsToMany(User::class, 'dentist_specialization', 'specialization_id', 'dentist_id');
    }
}
