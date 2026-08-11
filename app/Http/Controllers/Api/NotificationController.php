<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['type', 'is_read']);
        $filters['user_id'] = auth()->id();

        $notifications = $this->notificationService->list($filters);

        return response()->json(NotificationResource::collection($notifications));
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification = $this->notificationService->markAsRead($notification);

        return response()->json(new NotificationResource($notification));
    }

    public function markAllAsRead(): JsonResponse
    {
        $this->notificationService->markAllAsRead(auth()->user());

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function unreadCount(): JsonResponse
    {
        $count = Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
