<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\PropertyImageController;
use App\Http\Controllers\Api\RentalController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/profile', [AuthController::class, 'me']);
        Route::put('auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
    });

    Route::get('public/properties/featured', [PropertyController::class, 'featured']);
    Route::get('public/properties', [PropertyController::class, 'index']);
    Route::get('public/properties/{property:slug}', [PropertyController::class, 'show']);
    Route::post('public/properties/{property:slug}/quote', [PropertyController::class, 'quote']);
    Route::post('public/properties/{property:slug}/book', [PropertyController::class, 'book']);
    Route::get('public/properties/{property:slug}/calendar', [AvailabilityController::class, 'calendar']);
    Route::get('public/properties/{property:slug}/calendar.ics', [PropertyController::class, 'calendarExport']);
    Route::get('public/settings', [SettingController::class, 'index']);
    Route::get('public/testimonials', [TestimonialController::class, 'index'])
        ->defaults('active_only', true);
    Route::post('public/contact', [ContactController::class, 'store']);

    Route::middleware(['auth:sanctum', 'role:admin,manager,agent'])->group(function () {
        Route::apiResource('properties', PropertyController::class)->except(['index', 'show']);
        Route::put('properties/{property}/featured', [PropertyController::class, 'toggleFeatured']);
        Route::post('properties/{property}/images', [PropertyImageController::class, 'store']);
        Route::patch('property-images/{image}/primary', [PropertyImageController::class, 'setPrimary']);
        Route::delete('property-images/{image}', [PropertyImageController::class, 'destroy']);
        Route::get('properties/{property}/availability', [AvailabilityController::class, 'index']);
        Route::post('properties/{property}/availability', [AvailabilityController::class, 'store']);
        Route::post('properties/{property}/ical-import', [AvailabilityController::class, 'importIcs']);
        Route::delete('availability/{availability}', [AvailabilityController::class, 'destroy']);

        Route::apiResource('clients', ClientController::class);

        Route::apiResource('reservations', ReservationController::class)->only(['index', 'show', 'store', 'destroy']);
        Route::put('reservations/{reservation}/approve', [ReservationController::class, 'approve']);
        Route::put('reservations/{reservation}/reject', [ReservationController::class, 'reject']);
        Route::put('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
        Route::put('reservations/{reservation}/archive', [ReservationController::class, 'archive']);

        Route::get('rentals/active', [RentalController::class, 'active']);
        Route::get('rentals/upcoming', [RentalController::class, 'upcoming']);
        Route::get('rentals/expired', [RentalController::class, 'expired']);
        Route::apiResource('rentals', RentalController::class);

        Route::get('payments/reports/monthly', [PaymentController::class, 'monthlyReport']);
        Route::get('payments/reports/yearly', [PaymentController::class, 'yearlyReport']);
        Route::put('payments/{payment}/mark-paid', [PaymentController::class, 'markPaid']);
        Route::apiResource('payments', PaymentController::class);

        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::put('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::get('notifications', [NotificationController::class, 'index']);

        Route::apiResource('contacts', ContactController::class)->only(['index', 'show', 'destroy']);
        Route::put('contacts/{contact}/read', [ContactController::class, 'markAsRead']);

        Route::apiResource('testimonials', TestimonialController::class);

        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/revenue', [DashboardController::class, 'revenueChart']);
        Route::get('dashboard/property-types', [DashboardController::class, 'propertyTypes']);
        Route::get('dashboard/rental-stats', [DashboardController::class, 'occupancy']);
        Route::get('dashboard/activity', [DashboardController::class, 'recentActivity']);

        Route::get('activity-logs', [ActivityLogController::class, 'index']);
        Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show']);

        Route::put('settings', [SettingController::class, 'update']);
    });
});