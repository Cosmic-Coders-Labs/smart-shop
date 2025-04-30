<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with(['user', 'products'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
        ]);

        $totalAmount = 0;
        $productsData = [];

        foreach ($request->products as $item) {
            $product = Product::findOrFail($item['id']);
            if ($product->stock < $item['quantity']) {
                return response()->json(['error' => "Insufficient stock for product: {$product->name}"], 400);
            }
            $totalAmount += $product->price * $item['quantity'];
            $productsData[$product->id] = ['quantity' => $item['quantity']];
            $product->decrement('stock', $item['quantity']);
        }

        $order = Order::create([
            'user_id' => Auth::id(),
            'total_amount' => $totalAmount,
            'shipping_address' => $request->shipping_address,
            'status' => 'pending',
        ]);

        $order->products()->sync($productsData);

        return response()->json(['message' => 'Order created successfully', 'order' => $order->load('products')], 201);
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);
        return $order->load(['user', 'products']);
    }

    public function update(Request $request, Order $order)
    {
        $this->authorize('update', $order);
        $request->validate([
            'status' => 'sometimes|in:pending,processing,shipped,delivered,cancelled',
            'shipping_address' => 'sometimes|string',
        ]);

        $order->update($request->only('status', 'shipping_address'));
        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }
}
