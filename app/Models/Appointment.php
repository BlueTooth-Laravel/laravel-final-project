<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $table = 'appointments';

    protected $primaryKey = 'appointment_id';

    protected $fillable = [
        'patient_id',
        'dentist_id',
        'appointment_date',
        'purpose_of_appointment',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function dentist()
    {
        return $this->belongsTo(Dentist::class, 'dentist_id', 'dentist_id');
    }

    public function treatmentTypes()
    {
        return $this->belongsToMany(
            TreatmentType::class,
            'appointment_treatment',
            'appointment_id',
            'treatment_type_id'
        );
    }
}
