<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ReviewController extends Controller
{
    #[OA\Get(
        path: "/api/products/{productId}/reviews",
        summary: "Get all reviews for a product",
        tags: ["Reviews"]
    )]
    #[OA\Response(response: 200, description: "List of reviews")]
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with('user:_id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    #[OA\Post(
        path: "/api/products/{productId}/reviews",
        summary: "Add a review for a product",
        tags: ["Reviews"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 201, description: "Review created")]
    #[OA\Response(response: 400, description: "Not eligible to review")]
    public function store(Request $request, $productId)
    {
        $user = $request->user();

        // Check if user has purchased and received this product
        $order = Order::where('user_id', $user->_id)
            ->where('order_status', 'delivered')
            ->whereRaw(['items.product_id' => $productId])
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'You can only review products you have purchased and received'
            ], 400);
        }

        // Check if already reviewed
        $existingReview = Review::where('user_id', $user->_id)
            ->where('product_id', $productId)
            ->where('order_id', $order->_id)
            ->first();

        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this product'], 400);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'review_images' => 'nullable|array',
        ]);

        $review = Review::create([
            'user_id' => $user->_id,
            'product_id' => $productId,
            'order_id' => $order->_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'review_images' => $validated['review_images'] ?? [],
            'verified_purchase' => true,
            'helpful_count' => 0,
        ]);

        // Update product rating
        $this->updateProductRating($productId);

        return response()->json($review, 201);
    }

    #[OA\Delete(
        path: "/api/reviews/{id}",
        summary: "Delete a review",
        tags: ["Reviews"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Review deleted")]
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::findOrFail($id);

        // Only owner or admin can delete
        if ($review->user_id !== $user->_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $productId = $review->product_id;
        $review->delete();

        // Update product rating
        $this->updateProductRating($productId);

        return response()->json(['message' => 'Review deleted']);
    }

    // Helper function to update product rating
    private function updateProductRating($productId)
    {
        $reviews = Review::where('product_id', $productId)->get();
        $avgRating = $reviews->avg('rating');
        $reviewCount = $reviews->count();

        Product::where('_id', $productId)->update([
            'rating' => round($avgRating, 1),
            'review_count' => $reviewCount,
        ]);
    }

    #[OA\Get(
        path: "/api/user/pending-reviews",
        summary: "Get products pending review for logged-in user",
        tags: ["Reviews"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "List of products pending review")]
    public function pendingReviews(Request $request)
    {
        $user = $request->user();

        // Get all delivered orders
        $deliveredOrders = Order::where('user_id', $user->_id)
            ->where('order_status', 'delivered')
            ->get();

        $pendingProducts = [];

        foreach ($deliveredOrders as $order) {
            foreach ($order->items as $item) {
                $productId = $item['product_id'];

                // Check if already reviewed
                $reviewed = Review::where('user_id', $user->_id)
                    ->where('product_id', $productId)
                    ->where('order_id', $order->_id)
                    ->exists();

                if (!$reviewed) {
                    $product = Product::find($productId);
                    if ($product) {
                        $pendingProducts[] = [
                            'product' => $product,
                            'order_id' => $order->_id,
                            'order_date' => $order->created_at,
                        ];
                    }
                }
            }
        }

        return response()->json($pendingProducts);
    }
}
