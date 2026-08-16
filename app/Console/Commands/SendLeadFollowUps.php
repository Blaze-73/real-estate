<?php

namespace App\Console\Commands;

use App\Mail\LeadFollowUp;
use App\Models\Contact;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendLeadFollowUps extends Command
{
    protected $signature = 'lead-followups {--dry-run}';

    protected $description = 'Email contact-form leads at D+1, D+7 and D+30';

    public function handle(): int
    {
        $now = now();

        $leads = Contact::query()
            ->where('type', 'contact')
            ->whereNotNull('email')
            ->where(function ($query) use ($now) {
                $query->whereNull('follow_up_1_at')
                    ->where('created_at', '<=', $now->copy()->subDay());

                $query->orWhere(function ($query) use ($now) {
                    $query->whereNotNull('follow_up_1_at')
                        ->whereNull('follow_up_2_at')
                        ->where('created_at', '<=', $now->copy()->subDays(7));
                });

                $query->orWhere(function ($query) use ($now) {
                    $query->whereNotNull('follow_up_2_at')
                        ->whereNull('follow_up_3_at')
                        ->where('created_at', '<=', $now->copy()->subDays(30));
                });
            })
            ->get();

        if ($leads->isEmpty()) {
            $this->info('No follow-ups due.');

            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($leads as $contact) {
            $stage = $contact->follow_up_1_at === null ? 1 : ($contact->follow_up_2_at === null ? 2 : 3);
            $day = $stage === 1 ? 1 : ($stage === 2 ? 7 : 30);

            $this->line("  {$contact->email}: follow-up D+{$day}");

            if ($this->option('dry-run')) {
                continue;
            }

            Mail::to($contact->email)->queue(new LeadFollowUp($contact, $stage));

            $contact->update(["follow_up_{$stage}_at" => now()]);
            $sent++;
        }

        $this->info("Done. {$sent} follow-up(s) queued.");

        return self::SUCCESS;
    }
}