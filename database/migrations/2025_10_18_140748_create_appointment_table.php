<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // types of treatments offered by the dental clinic
        Schema::create('treatment_types', function (Blueprint $table) {
            $table->id(); // treatment_type_id
            $table->string('name'); // e.g., Cleaning, Filling, Extraction
            $table->string('description');
            $table->decimal('standard_cost', 8, 2);
            $table->integer('duration_minutes'); // Indicates the average time the treatment takes, helping schedule management and workflow planning.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // appointments table to schedule patient appointments with dentists
        Schema::create('appointments', function (Blueprint $table) {
            $table->id(); // appointment_id
            $table->foreignId('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('dentist_id')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['Scheduled', 'Completed', 'Cancelled'])->default('Scheduled');
            $table->dateTime('appointment_start_datetime');
            $table->dateTime('appointment_end_datetime')->nullable();
            $table->text('purpose_of_appointment')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            // Indexes to support calendar views and filtering
            $table->index(['dentist_id', 'appointment_start_datetime']);
            $table->index(['patient_id', 'appointment_start_datetime']);
            $table->index('status');
        });

        // pivot table to allow appointments to have many treatment types
        Schema::create('appointment_treatments_records', function (Blueprint $table) {
            $table->id(); // appoint_treat_id
            $table->foreignId('appointment_id')->constrained('appointments')->restrictOnDelete();
            $table->foreignId('treatment_type_id')->constrained('treatment_types')->restrictOnDelete();
            $table->text('treatment_notes')->nullable(); // notes on the treatment provided after the appointment
            $table->string('file_path')->nullable(); // path to any files related to the treatment
            $table->timestamps();

            $table->index('appointment_id');
            $table->index('treatment_type_id');
        });

        // optional multiple file uploads for a treatment record
        Schema::create('treatment_record_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_treatment_record_id')
                ->constrained('appointment_treatments_records')
                ->restrictOnDelete();
            $table->string('file_path');
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();

            $table->index('appointment_treatment_record_id');
        });

        // master teeth table
        Schema::create('teeth', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // pivot: which teeth were treated in a given appointment treatment record
        Schema::create('appointment_treatment_teeth', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_treatment_record_id')
                ->constrained('appointment_treatments_records')
                ->restrictOnDelete();
            $table->foreignId('tooth_id')->constrained('teeth')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['appointment_treatment_record_id', 'tooth_id']);
            $table->index('tooth_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_treatment_teeth');
        Schema::dropIfExists('teeth');
        Schema::dropIfExists('treatment_record_files');
        Schema::dropIfExists('appointment_treatments_records');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('treatment_types');
    }
};
