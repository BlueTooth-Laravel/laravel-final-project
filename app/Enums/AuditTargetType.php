<?php

namespace App\Enums;

enum AuditTargetType: string
{
    case DENTIST = 'dentist';
    case PATIENT = 'patient';
    case ADMIN = 'admin';
    case APPOINTMENT = 'appointment';
    case TREATMENT = 'treatment';
    case INVENTORY_ITEM = 'inventory-item';
    case BILLING = 'billing';
    case USER = 'user';
    case SETTING = 'setting';
    case ROLE = 'role';
    case PERMISSION = 'permission';
    case SPECIALIZATION = 'specialization';
    case TREATMENT_TYPE = 'treatment-type';
    case TREATMENT_RECORD = 'treatment-record';
    case CLINIC_AVAILABILITY = 'clinic-availability';
    case CLOSURE_EXCEPTION = 'closure-exception';

    /**
     * Get all available target types as an array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get target type label for display.
     */
    public function label(): string
    {
        return match ($this) {
            self::DENTIST => 'Dentist',
            self::PATIENT => 'Patient',
            self::ADMIN => 'Administrator',
            self::APPOINTMENT => 'Appointment',
            self::TREATMENT => 'Treatment',
            self::INVENTORY_ITEM => 'Inventory Item',
            self::BILLING => 'Billing',
            self::USER => 'User',
            self::SETTING => 'Setting',
            self::ROLE => 'Role',
            self::PERMISSION => 'Permission',
            self::SPECIALIZATION => 'Specialization',
            self::TREATMENT_TYPE => 'Treatment Type',
            self::TREATMENT_RECORD => 'Treatment Record',
            self::CLINIC_AVAILABILITY => 'Clinic Availability',
            self::CLOSURE_EXCEPTION => 'Closure Exception',
        };
    }
}
