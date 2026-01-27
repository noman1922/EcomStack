<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/register",
        summary: "Register a new user",
        tags: ["Auth"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "email", "password", "password_confirmation"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "John Doe"),
                new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "password123"),
                new OA\Property(property: "password_confirmation", type: "string", format: "password", example: "password123"),
                new OA\Property(property: "role", type: "string", example: "customer", enum: ["customer", "admin", "supplier"]),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Successful registration")]
    #[OA\Response(response: 422, description: "Validation error")]
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:customer,admin,supplier',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role ?? 'customer',
        ]);

        $tokenStr = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;
        $cookie = cookie('auth_token', $tokenStr, 60 * 24, null, null, false, true);

        return response()->json([
            'user' => $user,
        ])->withCookie($cookie);
    }

    #[OA\Post(
        path: "/api/login",
        summary: "Login user",
        tags: ["Auth"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password"],
            properties: [
                new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "password123"),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Successful login")]
    #[OA\Response(response: 422, description: "Invalid credentials")]
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $tokenStr = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;
        $cookie = cookie('auth_token', $tokenStr, 60 * 24, null, null, false, true);

        return response()->json([
            'user' => $user,
        ])->withCookie($cookie);
    }

    #[OA\Post(
        path: "/api/logout",
        summary: "Logout user",
        tags: ["Auth"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Logged out")]
    #[OA\Response(response: 401, description: "Unauthenticated")]
    public function logout(Request $request)
    {
        // $request->user()->currentAccessToken()->delete(); // Optional: revoking token
        $cookie = cookie()->forget('auth_token');
        return response()->json(['message' => 'Logged out'])->withCookie($cookie);
    }
}
