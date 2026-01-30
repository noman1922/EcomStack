<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    /**
     * Get all admin users
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Only super admin can view admins list
        if (!$user->is_super_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $admins = User::where('role', 'admin')->get(['_id', 'name', 'email', 'is_super_admin', 'created_at']);
        
        return response()->json($admins);
    }

    /**
     * Create a new admin user
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Only super admin can create admins
        if (!$user->is_super_admin) {
            return response()->json(['message' => 'Unauthorized. Only super admin can create admins.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $newAdmin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'is_super_admin' => false, // New admins are not super admins
        ]);

        return response()->json([
            'message' => 'Admin created successfully',
            'admin' => [
                '_id' => $newAdmin->_id,
                'name' => $newAdmin->name,
                'email' => $newAdmin->email,
                'is_super_admin' => $newAdmin->is_super_admin,
            ]
        ], 201);
    }

    /**
     * Delete an admin user
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        // Only super admin can delete admins
        if (!$user->is_super_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $admin = User::findOrFail($id);
        
        // Cannot delete super admin
        if ($admin->is_super_admin) {
            return response()->json(['message' => 'Cannot delete super admin'], 403);
        }

        // Cannot delete yourself
        if ($admin->_id === $user->_id) {
            return response()->json(['message' => 'Cannot delete yourself'], 403);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully']);
    }
}
