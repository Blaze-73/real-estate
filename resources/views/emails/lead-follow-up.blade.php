<x-mail::message>
# @if($stage === 1)Thanks for reaching out about Asilah
@elseif($stage === 2)Still looking for a place in Asilah?
@else
One last note about your Asilah search
@endif

@if($stage === 1)
We saw your message about finding a place in Asilah. Stays here book up fast in the summer season — if a listing caught your eye, tell us your dates and we will check availability for you directly.

Whether you are after a riad in the medina, a flat a short walk from Rmel Bay beach, or something near Bab Al Kasbah, we can point you the right way.
@elseif($stage === 2)
Just checking in — if you are still comparing options, we can help you shortlist. Tell us your dates and what matters most (sea view, medina location, parking) and we will send you the best matches from our current listings.
@else
We have not heard back since you got in touch, so we will leave you be after this note. If your plans are still open, reply any time — the Asilah team handles every key handover personally, from Rmel Bay to the medina.
@endif

**Your message:** "{{ $contact->subject }}"

<x-mail::button :url="url('/properties')">
Browse Asilah listings
</x-mail::button>

<x-mail::subcopy>
You received this because you contacted Asilah Estates about finding a place in Asilah. Just reply to this email — it reaches the team in Asilah directly.
</x-mail::subcopy>

Thanks,<br>
Asilah Estates — Rmel Bay · the medina · Bab Al Kasbah
</x-mail::message>