<?php

namespace Tests\Feature;

use App\Mail\LeadFollowUp;
use App\Models\Contact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendLeadFollowUpsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_queues_the_earliest_due_follow_up_per_lead(): void
    {
        Mail::fake();

        $d1 = $this->makeContact('Dina Alaoui', now()->subDays(2));
        $d7 = $this->makeContact('Karim Bensaid', now()->subDays(8), 1);
        $d30 = $this->makeContact('Sofia Marquez', now()->subDays(31), 2);

        $this->artisan('lead-followups')->assertSuccessful();

        Mail::assertQueued(LeadFollowUp::class, 3);

        $this->assertTrue($d1->fresh()->follow_up_1_at !== null);
        $this->assertNull($d1->fresh()->follow_up_2_at);
        $this->assertTrue($d7->fresh()->follow_up_2_at !== null);
        $this->assertNull($d7->fresh()->follow_up_3_at);
        $this->assertTrue($d30->fresh()->follow_up_3_at !== null);

        $this->artisan('lead-followups')->assertSuccessful();
        Mail::assertQueued(LeadFollowUp::class, 3);
    }

    public function test_it_skips_phone_reveal_leads_and_leads_not_yet_due(): void
    {
        Mail::fake();

        $this->makeContact('Omar El Fassi', now()->subDays(2), 0, 'phone_reveal');
        $this->makeContact('Lina Cherkaoui', now()->subMinutes(30));

        $this->artisan('lead-followups')->assertSuccessful();

        Mail::assertNothingQueued();
    }

    public function test_dry_run_does_not_send_or_mark(): void
    {
        Mail::fake();

        $contact = $this->makeContact('Hassan Amrani', now()->subDays(3));

        $this->artisan('lead-followups', ['--dry-run' => true])
            ->expectsOutputToContain('follow-up D+1')
            ->assertSuccessful();

        Mail::assertNothingQueued();
        $this->assertNull($contact->fresh()->follow_up_1_at);
    }

    private function makeContact(string $name, \DateTimeInterface $createdAt, int $followUpsSent = 0, string $type = 'contact'): Contact
    {
        $contact = Contact::create([
            'name' => $name,
            'email' => strtolower(str_replace(' ', '.', $name)).'@example.com',
            'phone' => '0611223344',
            'subject' => 'Riad in the medina',
            'message' => 'Looking for a riad near Bab Al Kasbah.',
            'type' => $type,
        ]);

        $contact->created_at = $createdAt;

        if ($followUpsSent >= 1) {
            $contact->follow_up_1_at = $createdAt->copy()->addDay();
        }

        if ($followUpsSent >= 2) {
            $contact->follow_up_2_at = $createdAt->copy()->addDays(7);
        }

        $contact->save();

        return $contact;
    }
}