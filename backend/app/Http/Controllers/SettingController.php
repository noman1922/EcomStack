<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function getReceiptQR()
    {
        try {
            $setting = Setting::first();
            return response()->json([
                'url' => $setting->receipt_qr_url ?? 'https://ecomstack.com'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'url' => 'https://ecomstack.com'
            ]);
        }
    }

    public function updateReceiptQR(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $setting = Setting::firstOrNew([]);
        $setting->receipt_qr_url = $request->url;
        $setting->save();

        return response()->json([
            'message' => 'QR URL updated successfully',
            'url' => $setting->receipt_qr_url
        ]);
    }
}
