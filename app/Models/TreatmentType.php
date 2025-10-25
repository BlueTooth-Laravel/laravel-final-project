<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreatmentType extends Model
{
    protected $table = 'treatment_types';

    protected $primaryKey = 'treatment_type_id';

    protected $fillable = [
        'name',
        'description',
        'standard_cost',
        'duration_minutes',
        'is_active',
    ];

    public function appointments()
    {
        return $this->belongsToMany(
            Appointment::class,
            'appointment_treatment',
            'treatment_type_id',
            'appointment_id'
        );
    }
}
