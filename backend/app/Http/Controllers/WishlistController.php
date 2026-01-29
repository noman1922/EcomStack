<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\Product;
use OpenApi\Attributes as OA;

class WishlistController extends Controller
{
    #[OA\Get(
        path: "/api/wishlist",
        summary: "Get user's wishlist",
        tags: ["Wishlist"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Wishlist items")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    public function index(Request $request)
    {
        $user = $request->user();
        
        $wishlistItems = Wishlist::where('user_id', $user->_id)
            ->get()
            ->map(function($item) {
                $product = Product::find($item->product_id);
                return [
                    'id' => $item->_id,
                    'product' => $product,
                    'created_at' => $item->created_at,
                ];
            })
            ->filter(fn($item) => $item['product'] !== null); // Filter out deleted products

        return response()->json($wishlistItems->values());
    }

    #[OA\Post(
        path: "/api/wishlist",
        summary: "Add product to wishlist",
        tags: ["Wishlist"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["product_id"],
            properties: [
                new OA\Property(property: "product_id", type: "string", example: "507f1f77bcf86cd799439011"),
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Product added to wishlist")]
    #[OA\Response(response: 400, description: "Product already in wishlist")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    #[OA\Response(response: 404, description: "Product not found")]
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|string',
        ]);

        $user = $request->user();
        $productId = $request->product_id;

        // Check if product exists
        $product = Product::find($productId);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Check if already in wishlist
        $exists = Wishlist::where('user_id', $user->_id)
            ->where('product_id', $productId)
            ->first();

        if ($exists) {
            return response()->json(['message' => 'Product already in wishlist'], 400);
        }

        $wishlistItem = Wishlist::create([
            'user_id' => $user->_id,
            'product_id' => $productId,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
            'item' => $wishlistItem,
        ], 201);
    }

    #[OA\Delete(
        path: "/api/wishlist/{productId}",
        summary: "Remove product from wishlist",
        tags: ["Wishlist"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "productId",
        in: "path",
        required: true,
        description: "Product ID to remove from wishlist",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(response: 200, description: "Product removed from wishlist")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    #[OA\Response(response: 404, description: "Product not in wishlist")]
    public function destroy(Request $request, $productId)
    {
        $user = $request->user();

        $wishlistItem = Wishlist::where('user_id', $user->_id)
            ->where('product_id', $productId)
            ->first();

        if (!$wishlistItem) {
            return response()->json(['message' => 'Product not in wishlist'], 404);
        }

        $wishlistItem->delete();

        return response()->json(['message' => 'Product removed from wishlist'], 200);
    }
}
