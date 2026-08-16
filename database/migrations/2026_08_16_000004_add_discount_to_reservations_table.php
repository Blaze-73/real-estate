<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('discount', 10, 2)->default(0)->after('total_price');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('promotion_id');
            $table->dropColumn('discount');
        });
    }
};