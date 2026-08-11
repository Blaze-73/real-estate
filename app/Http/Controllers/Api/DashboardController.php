<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function stats(): JsonResponse
    {
        return response()->json($this->dashboardService->getStats());
    }

    public function revenueChart(): JsonResponse
    {
        return response()->json($this->dashboardService->getRevenueChart());
    }

    public function propertyTypes(): JsonResponse
    {
        return response()->json($this->dashboardService->getPropertyTypeDistribution());
    }

    public function occupancy(): JsonResponse
    {
        return response()->json($this->dashboardService->getOccupancyRate());
    }

    public function recentActivity(): JsonResponse
    {
        return response()->json($this->dashboardService->getRecentActivity());
    }
}
