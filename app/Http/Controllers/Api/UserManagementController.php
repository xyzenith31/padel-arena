<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Menampilkan semua pengguna.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->get();

        return response()->json([
            'message' => 'Data pengguna berhasil diambil',
            'data' => $users
        ]);
    }

    /**
     * Menampilkan detail satu pengguna.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        
        return response()->json([
            'message' => 'Detail pengguna berhasil diambil',
            'data' => $user
        ]);
    }

    /**
     * Membuat akun baru (User atau Teknisi).
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['user', 'teknisi'])],
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ];

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user = User::create($data);

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    /**
     * Update data pengguna (termasuk ganti role atau hapus role/ubah jadi default).
     * "Menghapus role" dalam konteks single column biasanya berarti mengubahnya.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone_number' => 'sometimes|string|max:20',
            'role' => ['sometimes', Rule::in(['user', 'teknisi', 'admin'])],
            'password' => 'nullable|string|min:8',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->except(['password', 'avatar']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui',
            'data' => $user
        ]);
    }

    /**
     * Menghapus akun pengguna.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() == $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.'
            ], 403);
        }

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        return response()->json([
            'message' => 'Akun pengguna berhasil dihapus'
        ]);
    }
}