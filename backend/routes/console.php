<?php

use App\Models\GameKey;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('keys:purge-expired', function () {
    $days = (int) config('game_keys.retention_days', 30);
    $threshold = now()->subDays($days);

    $deleted = GameKey::query()
        ->where('status', 'used')
        ->whereNotNull('used_at')
        ->where('used_at', '<', $threshold)
        ->delete();

    $this->info("Deleted {$deleted} old used keys.");
})->purpose('Delete used game keys older than retention days');

Schedule::command('keys:purge-expired')
    ->dailyAt('03:00');
