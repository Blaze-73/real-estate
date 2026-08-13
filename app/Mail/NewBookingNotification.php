<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBookingNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Reservation $booking)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Booking ' . $this->booking->booking_reference . ' - ' . $this->booking->property->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new-booking-notification',
            with: [
                'booking' => $this->booking,
                'property' => $this->booking->property,
                'total' => $this->booking->total_price,
                'checkin' => $this->booking->check_in,
                'checkout' => $this->booking->check_out,
                'nights' => $this->booking->check_in?->diffInDays($this->booking->check_out),
            ],
        );
    }
}