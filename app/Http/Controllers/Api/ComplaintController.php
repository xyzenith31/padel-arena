<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'images' => 'array|max:6',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120'
        ]);

        $user = auth()->user();
        $userNameSlug = Str::slug($user->name);
        $imagePaths = [];

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $count = count($files);
            $timestamp = time(); 

            if ($count === 1) {
                $file = $files[0];
                $ext = $file->getClientOriginalExtension();
                $fileName = "{$userNameSlug}_{$timestamp}.{$ext}";
                
                $path = $file->storeAs('customer_service', $fileName, 'public');
                $imagePaths[] = $path;

            } else {
                $folderName = "customer_service/{$userNameSlug}_{$timestamp}";
                
                foreach ($files as $index => $file) {
                    $ext = $file->getClientOriginalExtension();
                    $fileName = "img_{$index}.{$ext}";
                    
                    $path = $file->storeAs($folderName, $fileName, 'public');
                    $imagePaths[] = $path;
                }
            }
        }

        Complaint::create([
            'user_id' => $user->id,
            'subject' => $request->subject,
            'category' => $request->category,
            'description' => $request->description,
            'images' => $imagePaths,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Keluhan berhasil dikirim.']);
    }

    public function index()
    {
        $complaints = Complaint::with('user')->latest()->get();
        return response()->json(['data' => $complaints]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,process,resolved,rejected',
            'admin_response' => 'nullable|string'
        ]);

        $complaint = Complaint::findOrFail($id);
        $complaint->update([
            'status' => $request->status,
            'admin_response' => $request->admin_response
        ]);

        return response()->json(['message' => 'Status keluhan diperbarui.']);
    }

    public function myComplaints()
    {
        $complaints = Complaint::where('user_id', auth()->id())->latest()->get();
        return response()->json(['data' => $complaints]);
    }
}