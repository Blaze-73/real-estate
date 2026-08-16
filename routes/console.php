<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('ical:sync')->hourly();
Schedule::command('saved-search:alerts')->dailyAt('06:00');
Schedule::command('lead-followups')->dailyAt('09:00');
