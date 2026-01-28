<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Product;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: "/api/products",
        summary: "Get all products",
        tags: ["Products"]
    )]
    #[OA\Response(response: 200, description: "List of products")]
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->has('on_sale')) {
            $query->where('is_on_sale', true);
        }

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('limit')) {
            return $query->take((int)$request->limit)->get();
        }

        return $query->get();
    }

    #[OA\Post(
        path: "/api/products",
        summary: "Create a new product",
        tags: ["Products"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "price", "stock"],
            properties: [
                new OA\Property(property: "name", type: "string"),
                new OA\Property(property: "description", type: "string"),
                new OA\Property(property: "price", type: "number", format: "float"),
                new OA\Property(property: "stock", type: "integer"),
                new OA\Property(property: "image", type: "string"),
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Product created")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock' => 'nullable|integer',
            'category' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        if (!isset($validated['stock'])) {
            $validated['stock'] = 99; // Default stock
        }

        return Product::create($validated);
    }

    #[OA\Get(
        path: "/api/products/{id}",
        summary: "Get product by ID",
        tags: ["Products"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))
        ]
    )]
    #[OA\Response(response: 200, description: "Product details")]
    #[OA\Response(response: 404, description: "Product not found")]
    public function show(string $id)
    {
        return Product::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->all());
        return $product;
    }

    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
