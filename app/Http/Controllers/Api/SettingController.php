<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Cache::remember('app_settings', now()->addMinutes(10), function () {
            return Setting::all()->pluck('value', 'key');
        });

        return response()->json($settings);
    }

    public function show(string $key): JsonResponse
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        return response()->json(['key' => $setting->key, 'value' => $setting->value]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|max:255',
            'settings.*.value' => 'required|string',
        ]);

        foreach ($validated['settings'] as $settingData) {
            Setting::updateOrCreate(
                ['key' => $settingData['key']],
                ['value' => $settingData['value']]
            );
        }

        Cache::forget('app_settings');

        $settings = Setting::all()->pluck('value', 'key');

        return response()->json($settings);
    }
}
