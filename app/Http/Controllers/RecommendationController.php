<?php

namespace App\Http\Controllers;

use App\Models\Recommendation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecommendationController extends Controller
{
    public function index()
    {
        return Recommendation::with(['user', 'product'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'score' => 'nullable|numeric|min:0|max:100',
            'reason' => 'nullable|string',
        ]);

        $recommendation = Recommendation::create($request->all());
        return response()->json(['message' => 'Recommendation created successfully', 'recommendation' => $recommendation], 201);
    }

    public function show(Recommendation $recommendation)
    {
        return $recommendation->load(['user', 'product']);
    }

    public function destroy(Recommendation $recommendation)
    {
        $recommendation->delete();
        return response()->json(['message' => 'Recommendation deleted successfully']);
    }

    public function getUserRecommendations()
    {
        $user = Auth::user();
        $recommendations = Recommendation::where('user_id', $user->id)
            ->with('product')
            ->orderBy('score', 'desc')
            ->get();

        return response()->json(['recommendations' => $recommendations]);
    }
}
