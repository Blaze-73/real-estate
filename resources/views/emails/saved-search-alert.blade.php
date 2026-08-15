<x-mail::message>
# New listings matching your saved search

@if($savedSearch->name)
**{{ $savedSearch->name }}**
@endif

{{ $properties->count() }} new propert{{ $properties->count() === 1 ? 'y' : 'ies' }} matching your criteria {{ $properties->count() === 1 ? 'was' : 'were' }} just added:

@foreach($properties as $property)
- **{{ $property->title }}** — {{ $property->city ?? 'Asilah' }} · {{ number_format((float) ($property->nightly_price ?: $property->price), 0) }} MAD/night — [View property]({{ url("/properties/{$property->slug}") }})
@endforeach

<x-mail::button :url="url($savedSearch->frontendUrl())">
View all matching properties
</x-mail::button>

<x-mail::subcopy>
You are receiving this because you saved this search. Manage your alerts anytime at [{{ url('/account/saved-searches') }}]({{ url('/account/saved-searches') }}).
</x-mail::subcopy>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>