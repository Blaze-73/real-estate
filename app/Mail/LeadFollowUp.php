<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadFollowUp extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contact $contact,
        public int $stage,
    ) {
    }

    public function envelope(): Envelope
    {
        $subject = match ($this->stage) {
            2 => 'Still looking for a place in Asilah?',
            3 => 'One last note about your Asilah search',
            default => 'Thanks for reaching out — the Asilah Estates team',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.lead-follow-up',
            with: [
                'contact' => $this->contact,
                'stage' => $this->stage,
            ],
        );
    }
}