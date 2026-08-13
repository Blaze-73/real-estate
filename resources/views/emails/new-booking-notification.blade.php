<x-mail::message>
# New Booking Request

A new booking request has been submitted.

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Reference | **{{ $booking->booking_reference }}** |
| Property | {{ $property->title }} |
| Guest | {{ $booking->guest_name }} |
| Check-in | {{ $checkin->format('d M Y') }} |
| Check-out | {{ $checkout->format('d M Y') }} |
| Nights | {{ $nights }} |
| Total | {{ number_format($total, 2) }} MAD |
| Status | {{ ucfirst($booking->status) }} |
</x-mail::table>

<x-mail::button :url="url('/admin')">
Open admin dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>