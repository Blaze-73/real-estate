<?php

namespace App\Services;

use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RevenueService
{
    public function getMonthlyRevenue(?int $year = null): array
    {
        $year = $year ?? Carbon::now()->year;

        $monthly = Payment::where('status', 'paid')
            ->whereYear('payment_date', $year)
            ->select(
                DB::raw('strftime("%m", payment_date) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $labels = [];
        $data = [];

        for ($i = 1; $i <= 12; $i++) {
            $month = str_pad((string)$i, 2, '0', STR_PAD_LEFT);
            $labels[] = Carbon::create()->month($i)->format('F');
            $data[] = (float) ($monthly[$month] ?? 0);
        }

        return compact('labels', 'data');
    }

    public function getYearlyRevenue(?int $startYear = null): array
    {
        $startYear = $startYear ?? Carbon::now()->subYears(4)->year;
        $endYear = Carbon::now()->year;

        $yearly = Payment::where('status', 'paid')
            ->whereYear('payment_date', '>=', $startYear)
            ->select(
                DB::raw('strftime("%Y", payment_date) as year'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('year')
            ->orderBy('year')
            ->pluck('total', 'year')
            ->toArray();

        $labels = [];
        $data = [];

        for ($year = $startYear; $year <= $endYear; $year++) {
            $labels[] = (string) $year;
            $data[] = (float) ($yearly[(string)$year] ?? 0);
        }

        return compact('labels', 'data');
    }

    public function getRevenueByPaymentMethod(): array
    {
        $methods = Payment::where('status', 'paid')
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method')
            ->toArray();

        return [
            'labels' => array_map('ucfirst', str_replace('_', ' ', array_keys($methods))),
            'data' => array_values($methods),
        ];
    }
}
