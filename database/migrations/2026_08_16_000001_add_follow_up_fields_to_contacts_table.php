<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('type')->default('contact')->after('message');
            $table->timestamp('follow_up_1_at')->nullable()->after('type');
            $table->timestamp('follow_up_2_at')->nullable()->after('follow_up_1_at');
            $table->timestamp('follow_up_3_at')->nullable()->after('follow_up_2_at');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['type', 'follow_up_1_at', 'follow_up_2_at', 'follow_up_3_at']);
        });
    }
};