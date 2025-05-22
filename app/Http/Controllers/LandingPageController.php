<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LandingPageController extends Controller
{
    public function index(Request $request)
    {
        $featuredProducts = Product::where('stock', '>', 0)
            ->with(['category', 'images'])
            ->take(6)
            ->get()
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'category' => $product->category->name,
                'images' => $product->images,
            ]);

        return Inertia::render('landing-page', [
            'featuredProducts' => $featuredProducts,
            'auth' => Auth::user() ? ['name' => Auth::user()->name] : null,
            'chatMessages' => ChatMessage::with('user')->get()->map(fn($msg) => [
                'id' => $msg->id,
                'user_id' => $msg->user_id,
                'message' => $msg->message,
                'is_bot' => $msg->is_bot,
                'user' => ['name' => $msg->user->name],
            ]),
        ]);
    }
}
