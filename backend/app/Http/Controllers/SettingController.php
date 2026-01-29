<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use OpenApi\Attributes as OA;

class SettingController extends Controller
{
    #[OA\Get(
        path: "/api/settings/{key}",
        summary: "Get setting by key",
        tags: ["Settings"]
    )]
    #[OA\Parameter(
        name: "key",
        in: "path",
        required: true,
        description: "Setting key (hero_images, footer_content, stores, currency)",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(response: 200, description: "Setting data")]
    #[OA\Response(response: 404, description: "Setting not found")]
    public function show($key)
    {
        $setting = Setting::where('key', $key)->first();
        
        if (!$setting) {
            // Return default values for common keys
            $defaults = [
                'hero_images' => [],
                'footer_content' => null,
                'stores' => [],
                'currency' => ['symbol' => 'tk', 'position' => 'after']
            ];
            
            return response()->json([
                'key' => $key,
                'value' => $defaults[$key] ?? null
            ]);
        }

        return response()->json($setting);
    }

    #[OA\Put(
        path: "/api/settings/{key}",
        summary: "Update setting (Admin only)",
        tags: ["Settings"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "key",
        in: "path",
        required: true,
        description: "Setting key",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["value"],
            properties: [
                new OA\Property(property: "value", type: "object", description: "Setting value (structure depends on key)"),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Setting updated")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    #[OA\Response(response: 403, description: "Not authorized (admin only)")]
    public function update(Request $request, $key)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'value' => 'required',
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($request->value) ? $request->value : json_decode($request->value, true),
                'type' => $this->getTypeFromKey($key)
            ]
        );

        return response()->json([
            'message' => 'Setting updated successfully',
            'setting' => $setting
        ]);
    }

    private function getTypeFromKey($key)
    {
        $typeMap = [
            'hero_images' => 'hero',
            'footer_content' => 'footer',
            'stores' => 'store',
            'currency' => 'general',
        ];

        return $typeMap[$key] ?? 'general';
    }

    #[OA\Get(
        path: "/api/settings",
        summary: "Get all settings",
        tags: ["Settings"]
    )]
    #[OA\Response(response: 200, description: "All settings")]
    public function index()
    {
        $settings = Setting::all();
        
        // Format response as key-value pairs
        $formatted = [];
        foreach ($settings as $setting) {
            $formatted[$setting->key] = $setting->value;
        }

        return response()->json($formatted);
    }
}
