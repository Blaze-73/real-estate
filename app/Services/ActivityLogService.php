<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    public function log(string $action, string $description, array $properties = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => auth('sanctum')->id(),
            'action' => $action,
            'description' => $description,
            'properties' => $properties ?: null,
        ]);
    }
}