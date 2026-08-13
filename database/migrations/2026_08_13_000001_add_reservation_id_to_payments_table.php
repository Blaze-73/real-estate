<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('rental_id')->nullable()->change();
            $table->foreignId('reservation_id')
                ->nullable()
                ->after('rental_id')
                ->constrained('reservations')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reservation_id');
            $table->unsignedBigInteger('rental_id')->nullable(false)->change();
        });
    }
};