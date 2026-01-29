<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\Order;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    // Get all receipts for authenticated user
    public function index(Request $request)
    {
        $user = $request->user();
        $receipts = Receipt::where('user_id', $user->_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($receipts);
    }

    // Get single receipt
    public function show($id)
    {
        $receipt = Receipt::findOrFail($id);
        return response()->json($receipt);
    }

    // Generate receipt for an order (called after payment)
    public function generateForOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string'
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'order_id' => $order->_id,
            'user_id' => $order->user_id,
            'receipt_type' => $order->source ?? 'online',
            'items' => $order->items,
            'subtotal' => $order->subtotal,
            'delivery_charge' => $order->delivery_charge,
            'discount' => 0,
            'total' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'customer_name' => $order->shipping_address['name'] ?? '',
            'customer_phone' => $order->shipping_address['phone'] ?? '',
            'customer_address' => $order->shipping_address['address'] ?? '',
            'tracking_id' => $order->tracking_id,
            'generated_at' => now(),
        ]);

        return response()->json($receipt);
    }

    // Generate POS receipt
    public function generatePOS(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|string',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric',
            'items.*.quantity' => 'required|integer',
            'subtotal' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'required|numeric',
            'cash_received' => 'nullable|numeric',
            'customer_name' => 'nullable|string',
        ]);

        $user = $request->user();

        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'receipt_type' => 'pos',
            'items' => $validated['items'],
            'subtotal' => $validated['subtotal'],
            'delivery_charge' => 0,
            'discount' => $validated['discount'] ?? 0,
            'total' => $validated['total'],
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'customer_name' => $validated['customer_name'] ?? 'Walk-in Customer',
            'generated_at' => now(),
            'generated_by' => $user->_id,
        ]);

        return response()->json($receipt);
    }

    // Generate manual order receipt
    public function generateManual(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
            'delivery_charge' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $user = $request->user();
        
        // Generate tracking ID for manual orders
        $trackingId = 'MAN-' . strtoupper(substr(md5(uniqid()), 0, 8));

        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'receipt_type' => 'manual',
            'items' => $validated['items'],
            'subtotal' => $validated['subtotal'],
            'delivery_charge' => $validated['delivery_charge'],
            'discount' => 0,
            'total' => $validated['total'],
            'payment_method' => 'offline',
            'payment_status' => 'received',
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'tracking_id' => $trackingId,
            'generated_at' => now(),
            'generated_by' => $user->_id,
        ]);

        return response()->json($receipt);
    }
}
