<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'cancelled', 'archived') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        Schema::table('reservations', function ($table) {
            $table->enum('status', ['pending', 'approved', 'rejected', 'archived'])->default('pending')->change();
        });
    }
};