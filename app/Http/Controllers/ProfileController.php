<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($request->validated());
        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $extension = $request->file('avatar')->getClientOriginalExtension();
            $fileName = $request->username . '.' . $extension;
            $request->file('avatar')->storeAs('avatar', $fileName, 'public');
            $user->avatar = 'avatar/' . $fileName;
        }
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
            'avatar_url' => asset('storage/' . $user->avatar) 
        ]);
    }

    public function destroyAvatar(Request $request)
    {
        $user = $request->user();
        if ($user->avatar) {
            if (Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = null;
            $user->save();
        }
        return response()->json([
            'message' => 'Avatar removed successfully',
            'user' => $user
        ]);
    }
}
