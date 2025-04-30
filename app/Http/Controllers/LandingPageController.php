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
            ->take(6)
            ->get(['id', 'name', 'price', 'category', 'image_url']);

        return Inertia::render('landing-page', [
            'featuredProducts' => $featuredProducts,
            'auth' => Auth::check() ? Auth::user() : null,
        ]);
    }
}
