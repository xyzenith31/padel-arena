<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerServiceTicket;
use App\Models\TicketResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CustomerServiceController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $tickets = CustomerServiceTicket::with('user')->latest()->get();
        } else {
            $tickets = CustomerServiceTicket::where('user_id', $user->id)
                        ->latest()
                        ->get();
        }

        return response()->json($tickets);
    }

    public function show($id)
    {
        $ticket = CustomerServiceTicket::with(['user', 'responses.user'])->findOrFail($id);

        if (Auth::user()->role !== 'admin' && Auth::user()->id !== $ticket->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($ticket);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('tickets/pelanggan_dan_teknisi', 'public');
        }

        $ticket = CustomerServiceTicket::create([
            'user_id' => Auth::id(),
            'ticket_number' => 'TKT-' . date('Ymd') . '-' . Str::upper(Str::random(4)),
            'subject' => $request->subject,
            'category' => $request->category,
            'description' => $request->description,
            'photo_path' => $path,
            'status' => 'open',
        ]);

        return response()->json(['message' => 'Tiket dibuat', 'data' => $ticket], 201);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $ticket = CustomerServiceTicket::findOrFail($id);
        $user = Auth::user();

        $folder = ($user->role === 'admin') 
                    ? 'tickets/admin' 
                    : 'tickets/pelanggan_dan_teknisi';

        $path = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store($folder, 'public');
        }

        $response = TicketResponse::create([
            'customer_service_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message,
            'photo_path' => $path,
        ]);

        if ($user->role === 'admin' && $ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }
        
        return response()->json(['message' => 'Balasan terkirim', 'data' => $response], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        $ticket = CustomerServiceTicket::findOrFail($id);
        
        if (Auth::user()->role !== 'admin' && Auth::user()->id !== $ticket->user_id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status tiket berhasil diperbarui.',
            'data' => $ticket
        ]);
    }

    public function markAsResolved(Request $request, $id)
    {
        $request->validate([
            'photo' => 'required|image|max:4096',
            'message' => 'nullable|string'
        ]);

        $ticket = CustomerServiceTicket::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $path = $request->file('photo')->store('tickets/admin', 'public');
        $finalMessage = $request->message ?? "Layanan telah diselesaikan. Berikut bukti pengerjaannya.";
        
        TicketResponse::create([
            'customer_service_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $finalMessage,
            'photo_path' => $path,
        ]);

        $ticket->update(['status' => 'resolved']);

        return response()->json([
            'message' => 'Layanan berhasil diselesaikan.',
            'data' => $ticket
        ]);
    }
}