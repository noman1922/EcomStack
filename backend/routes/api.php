<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReceiptController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);

// Public settings access
Route::get('/settings/receipt-qr', [SettingController::class, 'getReceiptQR']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/settings/{key}', [SettingController::class, 'show']);

// Public review access
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    
    // Wishlist Routes
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    
    // Review Routes (authenticated)
    Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('/user/pending-reviews', [ReviewController::class, 'pendingReviews']);
    
    // Settings Routes (Admin only for updates)
    Route::put('/settings/{key}', [SettingController::class, 'update']);
    
    // Receipt Routes
    Route::get('/receipts', [ReceiptController::class, 'index']);
    Route::get('/receipts/{id}', [ReceiptController::class, 'show']);
    Route::post('/receipts/generate', [ReceiptController::class, 'generateForOrder']);
    Route::post('/receipts/pos', [ReceiptController::class, 'generatePOS']);
    Route::post('/receipts/manual', [ReceiptController::class, 'generateManual']);
    
    // Sales Report Route
    Route::get('/admin/sales-report', [App\Http\Controllers\SalesController::class, 'getSalesReport']);
    
    // Admin Management Routes (Super Admin only)
    Route::get('/admins', [App\Http\Controllers\AdminController::class, 'index']);
    Route::post('/admins', [App\Http\Controllers\AdminController::class, 'store']);
    Route::delete('/admins/{id}', [App\Http\Controllers\AdminController::class, 'destroy']);
    
    // Settings Routes
    // Route::get('/settings/receipt-qr', [App\Http\Controllers\SettingController::class, 'getReceiptQR']); // Moved to public
    Route::post('/settings/receipt-qr', [App\Http\Controllers\SettingController::class, 'updateReceiptQR']);
    
    // Stripe Routes
    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
});
