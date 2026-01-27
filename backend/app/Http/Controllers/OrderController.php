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

        $trackingId = 'TRK-' . strtoupper(uniqid());

        $order = Order::create([
            'user_id' => $request->user()->id,
            'items' => $request->items,
            'total_amount' => $request->total_amount,
            'shipping_address' => $request->shipping_address,
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'paid', // Simulating successful stripe
            'order_status' => 'pending',
            'tracking_id' => $trackingId,
        ]);

        return response()->json($order, 201);
    }

    public function show(string $id)
    {
        return Order::findOrFail($id);
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
