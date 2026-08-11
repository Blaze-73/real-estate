<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Notification::query();

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_read'])) {
            $query->where('is_read', $filters['is_read']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function sendToUser(User $user, string $type, string $title, string $message): Notification
    {
        return $this->create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]);
    }

    public function sendToRole(string $role, string $type, string $title, string $message): void
    {
        $users = User::where('role', $role)->get();
        foreach ($users as $user) {
            $this->sendToUser($user, $type, $title, $message);
        }
    }

    public function sendToAll(string $type, string $title, string $message): void
    {
        $users = User::all();
        foreach ($users as $user) {
            $this->sendToUser($user, $type, $title, $message);
        }
    }

    public function markAsRead(Notification $notification): Notification
    {
        $notification->update(['is_read' => true]);
        return $notification->fresh();
    }

    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }
}
