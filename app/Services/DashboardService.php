<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Rental;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(): array
    {
        return [
            'total_properties' => Property::count(),
            'available_properties' => Property::where('status', 'available')->count(),
            'total_clients' => Client::count(),
            'active_rentals' => Rental::where('status', 'active')->count(),
            'pending_reservations' => Reservation::where('status', 'pending')->count(),
            'total_revenue' => Payment::where('status', 'paid')->sum('amount'),
            'monthly_revenue' => Payment::where('status', 'paid')
                ->whereMonth('payment_date', Carbon::now()->month)
                ->whereYear('payment_date', Carbon::now()->year)
                ->sum('amount'),
        ];
    }

    public function getRevenueChart(): array
    {
        $monthly = Payment::where('status', 'paid')
            ->whereYear('payment_date', Carbon::now()->year)
            ->pluck('amount', 'payment_date')
            ->toArray();

        $byMonth = array_fill(1, 12, 0.0);

        foreach ($monthly as $date => $amount) {
            $month = (int) Carbon::parse($date)->format('n');
            $byMonth[$month] += (float) $amount;
        }

        $labels = [];
        $data = [];

        foreach ($byMonth as $month => $total) {
            $labels[] = Carbon::create()->month($month)->format('F');
            $data[] = $total;
        }

        return [
            'labels' => $labels,
            'data' => $data,
        ];
    }

    public function getPropertyTypeDistribution(): array
    {
        $types = Property::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        return [
            'labels' => array_keys($types),
            'data' => array_values($types),
        ];
    }

    public function getOccupancyRate(): array
    {
        $total = Property::count();
        $rented = Property::where('status', 'rented')->count();
        $rate = $total > 0 ? round(($rented / $total) * 100, 2) : 0;

        return [
            'rate' => $rate,
            'rented' => $rented,
            'available' => Property::where('status', 'available')->count(),
            'maintenance' => Property::where('status', 'maintenance')->count(),
        ];
    }

    public function getRecentActivity(): array
    {
        $reservations = Reservation::with(['property', 'client'])
            ->latest()
            ->take(5)
            ->get()
            ->toArray();

        $payments = Payment::with('rental.property')
            ->latest()
            ->take(5)
            ->get()
            ->toArray();

        return [
            'reservations' => $reservations,
            'payments' => $payments,
        ];
    }
}
