<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\Product;

class WishlistController extends Controller
{
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
