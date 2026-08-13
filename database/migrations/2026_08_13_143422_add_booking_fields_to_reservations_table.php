<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('booking_reference')->nullable()->unique()->after('id');
            $table->decimal('total_price', 10, 2)->nullable()->after('message');
            $table->decimal('deposit', 10, 2)->default(0)->after('total_price');
            $table->unsignedInteger('guests')->nullable()->after('deposit');
            $table->string('guest_name')->nullable()->after('guests');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');
            $table->enum('channel', ['direct', 'airbnb', 'booking', 'other'])->default('direct')->after('guest_phone');
            $table->string('source')->nullable()->after('channel');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'booking_reference',
                'total_price',
                'deposit',
                'guests',
                'guest_name',
                'guest_email',
                'guest_phone',
                'channel',
                'source',
            ]);
        });
    }
};