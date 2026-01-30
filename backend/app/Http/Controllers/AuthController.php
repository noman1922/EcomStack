<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        return response()->json([
            'message' => 'Registration successful. Please login.',
            'user' => $user,
        ]);
    }

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

        $tokenStr = $user->createToken('auth_token', ['*'], now()->addHours(2))->plainTextToken;
        $cookie = cookie('auth_token', $tokenStr, 0, null, null, false, true);

        return response()->json([
            'user' => $user,
            'token' => $tokenStr,
            'token_type' => 'Bearer',
        ])->withCookie($cookie);
    }

    public function logout(Request $request)
    {
        // $request->user()->currentAccessToken()->delete(); // Optional: revoking token
        $cookie = cookie()->forget('auth_token');
        return response()->json(['message' => 'Logged out'])->withCookie($cookie);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->_id . ',_id',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
