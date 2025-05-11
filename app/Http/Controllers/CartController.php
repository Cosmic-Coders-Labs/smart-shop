<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        Log::info('CartController::index called');
        $cartItems = Cart::where('user_id', Auth::id())
            ->with(['product.category', 'product.images'])
            ->get();

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('CartController::store called', $request->all());

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            Log::info('Insufficient stock for store', ['product_id' => $request->product_id, 'stock' => $product->stock]);
            return Inertia::render('Products/Browse', [
                'products' => Product::with(['category', 'images'])->paginate(12),
                'categories' => \App\Models\Category::all(),
                'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'in_stock', 'tags']),
            ])->with('error', 'Insufficient stock available.');
        }

        $cartItem = Cart::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;
            if ($product->stock < $newQuantity) {
                Log::info('Cannot add more items than stock', ['product_id' => $request->product_id, 'newQuantity' => $newQuantity]);
                return Inertia::render('Products/Browse', [
                    'products' => Product::with(['category', 'images'])->paginate(12),
                    'categories' => \App\Models\Category::all(),
                    'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'in_stock', 'tags']),
                ])->with('error', 'Cannot add more items than available stock.');
            }
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        // Fetch updated cart items
        $cartItems = Cart::where('user_id', Auth::id())
            ->with(['product.category', 'product.images'])
            ->get();

        // Debug: Log flash message and session
        Log::info('Setting flash success for store', ['message' => 'Product added to cart successfully']);
        Log::info('Session data before flash', session()->all());
        session()->flash('success', 'Product added to cart successfully'); // Explicitly set flash
        Log::info('Session data after flash', session()->all());

        // Render cart page with success message
        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
        ])->with('success', 'Product added to cart successfully');
    }

    public function update(Request $request, Cart $cart)
    {
        Log::info('CartController::update called', ['cart_id' => $cart->id, 'quantity' => $request->quantity]);

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if ($cart->user_id !== Auth::id()) {
            Log::info('Unauthorized update attempt', ['cart_id' => $cart->id, 'user_id' => Auth::id()]);
            return Inertia::render('Cart/Index', [
                'cartItems' => Cart::where('user_id', Auth::id())->with(['product.category', 'product.images'])->get(),
            ])->with('error', 'Unauthorized');
        }

        $product = Product::findOrFail($cart->product_id);
        if ($product->stock < $request->quantity) {
            Log::info('Insufficient stock for update', ['cart_id' => $cart->id, 'stock' => $product->stock]);
            return Inertia::render('Cart/Index', [
                'cartItems' => Cart::where('user_id', Auth::id())->with(['product.category', 'product.images'])->get(),
            ])->with('error', 'Insufficient stock available.');
        }

        $cart->update(['quantity' => $request->quantity]);

        // Fetch updated cart items
        $cartItems = Cart::where('user_id', Auth::id())
            ->with(['product.category', 'product.images'])
            ->get();

        // Debug: Log flash message and session
        Log::info('Setting flash success for update', ['message' => 'Cart updated successfully']);
        Log::info('Session data before flash', session()->all());
        session()->flash('success', 'Cart updated successfully'); // Explicitly set flash
        Log::info('Session data after flash', session()->all());

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
        ])->with('success', 'Cart updated successfully');
    }

    public function destroy(Cart $cart)
    {
        Log::info('CartController::destroy called', ['cart_id' => $cart->id]);

        if ($cart->user_id !== Auth::id()) {
            Log::info('Unauthorized destroy attempt', ['cart_id' => $cart->id, 'user_id' => Auth::id()]);
            return Inertia::render('Cart/Index', [
                'cartItems' => Cart::where('user_id', Auth::id())->with(['product.category', 'product.images'])->get(),
            ])->with('error', 'Unauthorized');
        }

        $cart->delete();

        // Fetch updated cart items
        $cartItems = Cart::where('user_id', Auth::id())
            ->with(['product.category', 'product.images'])
            ->get();

        // Debug: Log flash message and session
        Log::info('Setting flash success for destroy', ['message' => 'Item removed from cart successfully']);
        Log::info('Session data before flash', session()->all());
        session()->flash('success', 'Item removed from cart successfully'); // Explicitly set flash
        Log::info('Session data after flash', session()->all());

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
        ])->with('success', 'Item removed from cart successfully');
    }
}
