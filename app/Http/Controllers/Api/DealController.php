<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealController extends Controller
{
    private const DEFAULT_SALE_RATE = 2.5;

    private const DEFAULT_RENT_RATE = 10;

    public function index(Request $request): JsonResponse
    {
        $deals = Deal::query()
            ->with(['property:id,title,slug,price,type,status', 'contact:id,name,email,phone'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('client_name', 'like', "%{$request->search}%")
                        ->orWhere('client_email', 'like', "%{$request->search}%")
                        ->orWhereHas('property', fn ($p) => $p->where('title', 'like', "%{$request->search}%"));
                });
            })
            ->when($request->property_id, fn ($q) => $q->where('property_id', $request->property_id))
            ->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return response()->json($deals);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->withCommission($this->validated($request));

        if (($data['status'] ?? 'contacted') === 'closed') {
            $data['closed_at'] = now();
        }

        $deal = Deal::create($data);

        return response()->json($deal->load(['property', 'contact']), 201);
    }

    public function show(Deal $deal): JsonResponse
    {
        return response()->json($deal->load(['property', 'contact']));
    }

    public function update(Request $request, Deal $deal): JsonResponse
    {
        $data = $this->validated($request, $deal);

        if (($data['status'] ?? $deal->status) === 'closed') {
            $data['closed_at'] = $data['closed_at'] ?? now();
        } elseif (isset($data['status'])) {
            $data['closed_at'] = null;
        }

        $deal->update($this->withCommission($data));

        return response()->json($deal->load(['property', 'contact']));
    }

    public function destroy(Deal $deal): JsonResponse
    {
        $deal->delete();

        return response()->json(['message' => __('Deal deleted.')]);
    }

    public function stats(): JsonResponse
    {
        $closed = Deal::closed();

        return response()->json([
            'total_commission' => (float) $closed->sum('commission_amount'),
            'total_deals' => Deal::count(),
            'closed_deals' => (clone $closed)->count(),
            'active_deals' => Deal::whereNotIn('status', ['closed', 'lost'])->count(),
            'status_counts' => Deal::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
            'by_month' => Deal::closed()
                ->where('closed_at', '>=', now()->subMonths(6)->startOfMonth())
                ->get()
                ->groupBy(fn ($deal) => $deal->closed_at?->format('Y-m'))
                ->map(fn ($group) => [
                    'deals' => $group->count(),
                    'commission' => (float) $group->sum('commission_amount'),
                ]),
            'recent' => Deal::closed()
                ->with('property:id,title,slug')
                ->latest('closed_at')
                ->take(5)
                ->get(),
        ]);
    }

    private function validated(Request $request, ?Deal $deal = null): array
    {
        return $request->validate([
            'property_id' => $deal ? 'sometimes|exists:properties,id' : 'required|exists:properties,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'type' => $deal ? 'sometimes|in:' . implode(',', Deal::TYPES) : 'required|in:' . implode(',', Deal::TYPES),
            'status' => 'sometimes|in:' . implode(',', Deal::STATUSES),
            'client_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
            'client_phone' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|between:0,100',
            'notes' => 'nullable|string',
        ]);
    }

    private function withCommission(array $data): array
    {
        if (isset($data['type'])) {
            $rateKey = $data['type'] === 'sale' ? 'commission_sale_rate' : 'commission_rent_rate';
            $fallback = $data['type'] === 'sale' ? self::DEFAULT_SALE_RATE : self::DEFAULT_RENT_RATE;

            $default = (float) Setting::where('key', $rateKey)->value('value');
            $default = $default > 0 ? $default : $fallback;

            $rate = isset($data['commission_rate']) && $data['commission_rate'] !== null
                ? (float) $data['commission_rate']
                : $default;

            $data['commission_rate'] = $rate;

            if (isset($data['price']) && $data['price'] !== null) {
                $data['commission_amount'] = round(((float) $data['price'] * $rate) / 100, 2);
            }
        }

        return $data;
    }
}