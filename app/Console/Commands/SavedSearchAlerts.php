<?php

namespace App\Console\Commands;

use App\Mail\SavedSearchAlert;
use App\Models\SavedSearch;
use App\Repositories\PropertyRepository;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SavedSearchAlerts extends Command
{
    protected $signature = 'saved-search:alerts {--dry-run}';

    protected $description = 'Email each active saved search the properties created since its last alert';

    public function handle(): int
    {
        $searches = SavedSearch::query()
            ->with('user')
            ->where('active', true)
            ->get();

        if ($searches->isEmpty()) {
            $this->info('No active saved searches.');

            return self::SUCCESS;
        }

        $repository = new PropertyRepository();
        $sent = 0;

        foreach ($searches as $search) {
            $cutoff = $search->last_alert_at ?? $search->created_at;

            $filters = array_merge((array) $search->filters, [
                'status' => 'available',
                'per_page' => 100,
                'sort_by' => 'created_at',
                'sort_order' => 'desc',
            ]);

            $matches = collect($repository->paginate($filters)->items())
                ->filter(fn ($property) => $property->created_at > $cutoff);

            if ($matches->isEmpty()) {
                continue;
            }

            $this->line("  {$search->user->email}: {$matches->count()} new propert" . ($matches->count() === 1 ? 'y' : 'ies'));

            if ($this->option('dry-run')) {
                continue;
            }

            Mail::to($search->user->email)->queue(new SavedSearchAlert($search, $matches->values()));

            $search->update(['last_alert_at' => now()]);
            $sent++;
        }

        $this->info("Done. {$sent} alert(s) sent.");

        return self::SUCCESS;
    }
}