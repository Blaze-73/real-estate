<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('gateway')->nullable()->after('payment_method');
            $table->string('gateway_reference')->nullable()->after('gateway');
            $table->string('gateway_status')->nullable()->after('gateway_reference');
            $table->timestamp('paid_at')->nullable()->after('gateway_status');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['gateway', 'gateway_reference', 'gateway_status', 'paid_at']);
        });
    }
};