<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'manager', 'agent', 'customer') NOT NULL DEFAULT 'customer'");
    }

    public function down(): void
    {
        Schema::table('users', function ($table) {
            $table->enum('role', ['admin', 'manager', 'agent'])->default('agent')->after('email')->change();
        });
    }
};