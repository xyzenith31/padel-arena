<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PadelCourt;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PadelController extends Controller
{
    public function index()
    {
        $courts = PadelCourt::latest()->get();
        return response()->json(['data' => $courts]);
    }

    public function show($id)
    {
        $court = PadelCourt::find($id);
        if (!$court) return response()->json(['message' => 'Lapangan tidak ditemukan'], 404);
        
        return response()->json(['data' => $court]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'operational_hours' => 'required',
            'facilities' => 'required',
            'price_per_hour' => 'required|numeric',
            'price_per_day' => 'required|numeric',
            'province_id' => 'required',
            'province_name' => 'required',
            'city_id' => 'required',
            'city_name' => 'required',
            'address' => 'required|string',
            'postal_code' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'images' => 'array|max:6',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $folderName = Str::slug($request->name);
        $basePath = "padel_view/{$folderName}";

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarFile = $request->file('avatar');
            $avatarName = 'avatar_' . time() . '.' . $avatarFile->getClientOriginalExtension();
            $avatarPath = $avatarFile->storeAs($basePath, $avatarName, 'public');
        }

        $galleryPaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $imageName = "gallery_{$index}_" . time() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs($basePath, $imageName, 'public');
                $galleryPaths[] = $path;
            }
        }

        $operationalHours = is_string($request->operational_hours) ? json_decode($request->operational_hours, true) : $request->operational_hours;
        $facilities = is_string($request->facilities) ? json_decode($request->facilities, true) : $request->facilities;

        $padelCourt = PadelCourt::create([
            'name' => $request->name,
            'description' => $request->description,
            'operational_hours' => $operationalHours,
            'facilities' => $facilities,
            'price_per_hour' => $request->price_per_hour,
            'price_per_day' => $request->price_per_day,
            'province_id' => $request->province_id,
            'province_name' => $request->province_name,
            'city_id' => $request->city_id,
            'city_name' => $request->city_name,
            'address' => $request->address,
            'postal_code' => $request->postal_code,
            'email' => $request->email,
            'phone' => $request->phone,
            'avatar' => $avatarPath,
            'images' => $galleryPaths,
        ]);

        return response()->json(['message' => 'Lapangan Padel berhasil dibuat', 'data' => $padelCourt], 201);
    }

    public function update(Request $request, $id)
    {
        $padelCourt = PadelCourt::find($id);
        if (!$padelCourt) return response()->json(['message' => 'Lapangan tidak ditemukan'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'operational_hours' => 'required',
            'facilities' => 'required',
            'price_per_hour' => 'required|numeric',
            'price_per_day' => 'required|numeric',
            'province_id' => 'required',
            'city_id' => 'required',
            'address' => 'required|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'images' => 'array|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $folderName = Str::slug($request->name);
        $basePath = "padel_view/{$folderName}";

        if ($request->hasFile('avatar')) {
            if ($padelCourt->avatar && Storage::disk('public')->exists($padelCourt->avatar)) {
                Storage::disk('public')->delete($padelCourt->avatar);
            }
            $avatarFile = $request->file('avatar');
            $avatarName = 'avatar_' . time() . '.' . $avatarFile->getClientOriginalExtension();
            $padelCourt->avatar = $avatarFile->storeAs($basePath, $avatarName, 'public');
        }

        $existingImages = [];
        if($request->has('existing_images')) {
            $existingImages = json_decode($request->existing_images, true) ?? [];
        }

        $currentDbImages = $padelCourt->images ?? [];
        $imagesToDelete = array_diff($currentDbImages, $existingImages);
        
        foreach($imagesToDelete as $imgToDelete) {
            if(Storage::disk('public')->exists($imgToDelete)) {
                Storage::disk('public')->delete($imgToDelete);
            }
        }

        $finalImages = $existingImages;

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $imageName = "gallery_" . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs($basePath, $imageName, 'public');
                $finalImages[] = $path;
            }
        }

        $padelCourt->images = $finalImages;
        $operationalHours = is_string($request->operational_hours) ? json_decode($request->operational_hours, true) : $request->operational_hours;
        $facilities = is_string($request->facilities) ? json_decode($request->facilities, true) : $request->facilities;

        $padelCourt->update([
            'name' => $request->name,
            'description' => $request->description,
            'operational_hours' => $operationalHours,
            'facilities' => $facilities,
            'price_per_hour' => $request->price_per_hour,
            'price_per_day' => $request->price_per_day,
            'province_id' => $request->province_id,
            'province_name' => $request->province_name,
            'city_id' => $request->city_id,
            'city_name' => $request->city_name,
            'address' => $request->address,
            'postal_code' => $request->postal_code,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        return response()->json(['message' => 'Lapangan Padel berhasil diperbarui', 'data' => $padelCourt]);
    }

    public function destroy($id)
    {
        $court = PadelCourt::find($id);
        if (!$court) return response()->json(['message' => 'Not found'], 404);

        $folderName = Str::slug($court->name);
        Storage::disk('public')->deleteDirectory("padel_view/{$folderName}");

        $court->delete();
        return response()->json(['message' => 'Lapangan berhasil dihapus']);
    }
}