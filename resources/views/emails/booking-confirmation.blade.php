<x-mail::message>
# Booking Confirmed

Hi **{{ $booking->guest_name }}**,

Your booking request for **{{ $property->title }}** has been received.

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Reference | **{{ $booking->booking_reference }}** |
| Check-in | {{ $checkin->format('d M Y') }} |
| Check-out | {{ $checkout->format('d M Y') }} |
| Nights | {{ $nights }} |
| Total | {{ number_format($total, 2) }} MAD |
| Status | {{ ucfirst($booking->status) }} |
</x-mail::table>

Our team will confirm your stay shortly. A deposit of **{{ number_format((float) $booking->deposit, 2) }} MAD** may be required to finalize the booking.

<x-mail::button :url="url('/')">
Visit our site
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>