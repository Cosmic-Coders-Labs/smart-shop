<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LandingPageController extends Controller
{
    public function index(Request $request)
    {
        $featuredProducts = Product::where('stock', '>', 0)
            ->with('category')
            ->take(6)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'category' => $product->category->name, // Use category name
                    'image_url' => $product->image_url,
                ];
            });

        return Inertia::render('landing-page', [
            'featuredProducts' => $featuredProducts,
            'auth' => Auth::check() ? Auth::user() : null,
        ]);
    }
}
