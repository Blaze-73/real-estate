<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->decimal('nightly_price', 10, 2)->nullable()->after('price');
            $table->decimal('monthly_price', 10, 2)->nullable()->after('nightly_price');
            $table->unsignedInteger('min_nights')->default(1)->after('monthly_price');
            $table->decimal('cleaning_fee', 10, 2)->default(0)->after('min_nights');
            $table->decimal('deposit', 10, 2)->default(0)->after('cleaning_fee');
            $table->date('high_season_from')->nullable()->after('deposit');
            $table->date('high_season_to')->nullable()->after('high_season_from');
            $table->decimal('high_season_price', 10, 2)->nullable()->after('high_season_to');
            $table->string('ical_url')->nullable()->after('high_season_price');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'nightly_price',
                'monthly_price',
                'min_nights',
                'cleaning_fee',
                'deposit',
                'high_season_from',
                'high_season_to',
                'high_season_price',
                'ical_url',
            ]);
        });
    }
};