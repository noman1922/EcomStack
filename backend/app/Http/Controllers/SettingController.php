<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        try {
            return response()->json(Setting::first() ?? new Setting());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($key)
    {
        try {
            $setting = Setting::where('key', $key)->first();
            return response()->json(['value' => $setting->value ?? null]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getReceiptQR()
    {
        try {
            $setting = Setting::where('key', 'pos_qr_url')->first();
            return response()->json([
                'url' => ($setting && $setting->value) ? $setting->value : 'https://ecomstack.com'
            ]);
        } catch (\Exception $e) {
            return response()->json(['url' => 'https://ecomstack.com']);
        }
    }

    public function updateReceiptQR(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $setting = Setting::where('key', 'pos_qr_url')->firstOrNew(['key' => 'pos_qr_url']);
        $setting->value = $request->url;
        $setting->save();

        return response()->json([
            'message' => 'QR URL updated successfully',
            'url' => $setting->value
        ]);
    }
    public function update(Request $request, $key)
    {
        try {
            $setting = Setting::where('key', $key)->firstOrNew(['key' => $key]);
            $setting->value = $request->value;
            $setting->save();

            return response()->json([
                'message' => 'Setting updated successfully',
                'value' => $setting->value
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
