<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Order;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{
    #[OA\Get(
        path: "/api/orders",
        summary: "Get all user orders",
        tags: ["Orders"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "List of orders")]
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            return Order::orderBy('created_at', 'desc')->get();
        }
        return Order::where('user_id', $request->user()->id)->orderBy('created_at', 'desc')->get();
    }

    #[OA\Post(
        path: "/api/orders",
        summary: "Create a new order",
        tags: ["Orders"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["items", "total_price"],
            properties: [
                new OA\Property(property: "items", type: "array", items: new OA\Items(type: "object")),
                new OA\Property(property: "total_price", type: "number", format: "float"),
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Order created")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'total_amount' => 'required|numeric',
            'shipping_address' => 'required|array',
            'payment_method' => 'required|string',
        ]);

        // Validate stock availability for all items
        $items = $request->items;
        foreach ($items as $item) {
            $pid = $item['product_id'] ?? ($item['_id'] ?? ($item['id'] ?? null));
            $product = \App\Models\Product::find($pid);
            
            if (!$product) {
                return response()->json([
                    'message' => "Product not found: " . ($item['name'] ?? 'Unknown')
                ], 404);
            }
            
            $currentStock = (int)$product->stock; // Ensure integer
            $requestedQty = (int)$item['quantity'];
            
            if ($currentStock < $requestedQty) {
                return response()->json([
                    'message' => "{$product->name} is out of stock. Available: {$currentStock}, Requested: {$requestedQty}"
                ], 400);
            }
        }

        $trackingId = 'TRK-' . strtoupper(uniqid());

        $order = Order::create([
            'user_id' => $request->user()->id,
            'items' => $request->items,
            'subtotal' => $request->subtotal ?? $request->total_amount,
            'delivery_charge' => $request->delivery_charge ?? 0,
            'total_amount' => $request->total_amount,
            'shipping_address' => $request->shipping_address,
            'payment_method' => $request->payment_method,
            'payment_id' => $request->payment_id,
            'payment_status' => $request->payment_status ?? 'pending',
            'order_status' => $request->order_status ?? 'pending',
            'tracking_id' => $trackingId,
            'source' => $request->source ?? 'online',
            'customer_name' => $request->customer_name,
            'discount_amount' => $request->discount_amount ?? 0,
        ]);

        // Deduct stock after successful order creation
        foreach ($items as $item) {
            $pid = $item['product_id'] ?? ($item['_id'] ?? ($item['id'] ?? null));
            $product = \App\Models\Product::find($pid);
            if ($product) {
                $newStock = (int)$product->stock - (int)$item['quantity'];
                $product->stock = max(0, $newStock); // Ensure never negative
                $product->save();
            }
        }

        return response()->json($order, 201);
    }

    public function show(string $id)
    {
        $order = Order::where('tracking_id', $id)
                    ->orWhere('_id', $id)
                    ->orWhere('id', $id)
                    ->first();
        
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        
        return $order;
    }

    public function updateStatus(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['order_status' => 'required|string']);
        $order = Order::findOrFail($id);
        $order->update(['order_status' => $request->order_status]);
        
        return $order;
    }

    public function destroy(string $id)
    {
        Order::findOrFail($id)->delete();
        return response()->json(['message' => 'Order deleted']);
    }
}
