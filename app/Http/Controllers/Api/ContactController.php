<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Contact::query();

        if ($request->boolean('unread_only')) {
            $query->unread();
        }

        $contacts = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($contacts);
    }

    public function show(Contact $contact): JsonResponse
    {
        return response()->json($contact);
    }

    public function store(StoreContactRequest $request): JsonResponse
    {
        $contact = Contact::create($request->validated());

        return response()->json($contact, 201);
    }

    public function markAsRead(Contact $contact): JsonResponse
    {
        $contact->update(['is_read' => true]);

        return response()->json($contact);
    }

    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }
}
