<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    public function index()
    {
        return response()->json(Office::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'province' => 'required',
            'city' => 'required',
            'address' => 'required',
            'postal_code' => 'required',
        ]);

        $office = \App\Models\Office::create([
            'name' => $request->name,
            'province' => $request->province,
            'city' => $request->city,
            'address' => $request->address,
            'postal_code' => $request->postal_code,
        ]);

        return response()->json($office);
    }
    
    public function destroy($id)
    {
        Office::destroy($id);
        return response()->json(['message' => 'Kantor dihapus']);
    }
}