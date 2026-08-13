<?php

namespace App\Console\Commands;

use App\Models\Property;
use App\Models\PropertyAvailability;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class IcalSync extends Command
{
    protected $signature = 'ical:sync {--property=} {--dry-run}';

    protected $description = 'Import availability blocks from remote iCal feeds into property_availability';

    public function handle(): int
    {
        $query = Property::whereNotNull('ical_url')->where('ical_url', '!=', '');

        if ($propertyId = $this->option('property')) {
            $query->where('id', $propertyId);
        }

        $properties = $query->get();

        if ($properties->isEmpty()) {
            $this->info('No properties with an iCal URL configured.');

            return self::SUCCESS;
        }

        foreach ($properties as $property) {
            $this->line("Syncing {$property->title} ({$property->ical_url})");

            try {
                $response = Http::timeout(20)->get($property->ical_url);
            } catch (\Throwable $e) {
                $this->error("  Network error: {$e->getMessage()}");

                continue;
            }

            if (!$response->ok()) {
                $this->error("  HTTP {$response->status()}");

                continue;
            }

            $events = $this->parseVEvents($response->body());

            if ($this->option('dry-run')) {
                $this->info("  [dry-run] Found " . count($events) . " events, would replace current ical blocks.");

                continue;
            }

            PropertyAvailability::where('property_id', $property->id)
                ->where('source', 'ical')
                ->delete();

            foreach ($events as $event) {
                PropertyAvailability::create([
                    'property_id' => $property->id,
                    'start_date' => $event['start'],
                    'end_date' => $event['end'],
                    'reason' => 'blocked',
                    'source' => 'ical',
                    'ical_event_id' => $event['uid'],
                ]);
            }

            $this->info("  Synced " . count($events) . " blocks.");
        }

        return self::SUCCESS;
    }

    private function parseVEvents(string $ics): array
    {
        $events = [];

        $blocks = preg_split('/BEGIN:VEVENT\s*\r?\n/', $ics);

        foreach ($blocks as $block) {
            if (!str_contains($block, 'END:VEVENT')) {
                continue;
            }

            $lines = preg_split('/\r?\n/', $block);
            $fields = [];

            foreach ($lines as $line) {
                if (str_contains($line, ':')) {
                    [$key, $value] = explode(':', $line, 2);
                    $fields[trim($key)] = trim($value);
                }
            }

            $uid = $fields['UID'] ?? null;

            $start = $this->parseDate($fields['DTSTART;VALUE=DATE'] ?? $fields['DTSTART'] ?? null);
            $end = $this->parseDate($fields['DTEND;VALUE=DATE'] ?? $fields['DTEND'] ?? null);

            if (!$start) {
                continue;
            }

            if (!$end) {
                $end = $start->copy()->addDay();
            }

            $events[] = [
                'uid' => $uid,
                'start' => $start->toDateString(),
                'end' => $end->copy()->subDay()->toDateString(),
            ];
        }

        return $events;
    }

    private function parseDate(?string $value): ?Carbon
    {
        if (!$value) {
            return null;
        }

        $clean = preg_replace('/T[0-9]{6}Z?$/', '', $value);

        try {
            return Carbon::parse($clean);
        } catch (\Throwable) {
            return null;
        }
    }
}