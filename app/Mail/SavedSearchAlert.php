<?php

namespace App\Mail;

use App\Models\SavedSearch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SavedSearchAlert extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public SavedSearch $savedSearch,
        public $properties,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->savedSearch->name
                ? "New listings matching \"{$this->savedSearch->name}\""
                : 'New listings matching your saved search',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.saved-search-alert',
        );
    }
}