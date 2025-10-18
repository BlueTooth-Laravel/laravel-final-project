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
        Schema::create('dentists', function (Blueprint $table) {
            $table->id('dentist_id');
            $table->string('dentist_fname');
            $table->string('dentist_mname')->nullable();
            $table->string('dentist_lname');
            $table->integer('specialization');
            $table->string('contact_number')->unique();
            $table->string('email')->unique();
            $table->timestamps();
        });

        Schema::create('specialization', function (Blueprint $table) {
            $table->id('specialization_id');
            $table->string('specialization_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dentists');
        Schema::dropIfExists('specialization');
    }
};
