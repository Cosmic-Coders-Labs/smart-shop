<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Recommendation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function customerAnalytics(Request $request)
    {
        try {
            $userId = Auth::id();
            $recentOrders = Order::with(['products' => function ($query) {
                $query->select('products.id', 'products.name');
            }])
                ->where('user_id', $userId)
                ->latest()
                ->take(5)
                ->get();

            // Log raw products data for debugging
            Log::info('Customer Analytics: Raw Recent Orders Products', [
                'user_id' => $userId,
                'orders' => $recentOrders->map(function ($order) {
                    return [
                        'order_id' => $order->id,
                        'products' => $order->products->toArray(),
                    ];
                })->toArray(),
            ]);

            $recentOrders = $recentOrders->map(function ($order) {
                $products = $order->products->isEmpty()
                    ? [['name' => 'No Products Found', 'quantity' => 0]]
                    : $order->products->map(function ($product) {
                        return [
                            'name' => $product->name ?? 'Unknown Product',
                            'quantity' => $product->pivot->quantity ?? 1,
                        ];
                    })->toArray();

                return [
                    'id' => $order->id,
                    'total_amount' => (float) ($order->total_amount ?? 0),
                    'status' => $order->status,
                    'products' => $products,
                    'created_at' => $order->created_at->toDateTimeString(),
                ];
            });

            // Log mapped orders for debugging
            Log::info('Customer Analytics: Mapped Recent Orders', [
                'user_id' => $userId,
                'orders' => $recentOrders->toArray(),
            ]);

            $cartItems = Cart::with(['product'])
                ->where('user_id', $userId)
                ->get()
                ->map(function ($cart) {
                    return [
                        'product_id' => $cart->product_id,
                        'product_name' => $cart->product ? $cart->product->name : 'N/A',
                        'quantity' => $cart->quantity,
                        'price' => $cart->product ? (float) $cart->product->price : 0,
                    ];
                });

            $recommendations = Recommendation::with(['product'])
                ->where('user_id', $userId)
                ->orderBy('score', 'desc')
                ->take(5)
                ->get()
                ->map(function ($rec) {
                    return [
                        'product_id' => $rec->product_id,
                        'product_name' => $rec->product ? $rec->product->name : 'N/A',
                        'score' => (float) ($rec->score ?? 0),
                        'reason' => $rec->reason ?? 'Based on your preferences',
                    ];
                });

            return Inertia::render('dashboard', [
                'user' => [
                    'name' => Auth::user()->name,
                ],
                'recent_orders' => $recentOrders,
                'cart_items' => $cartItems,
                'recommendations' => $recommendations,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in customerAnalytics', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Redirect::route('dashboard')->with('error', 'Failed to load dashboard data');
        }
    }

    public function analytics(Request $request)
    {
        try {
            // Total Products
            $totalProducts = Product::count();

            // Total Sales (delivered and shipped orders)
            $totalSales = Order::whereIn('status', ['delivered', 'shipped'])
                ->sum('total_amount');

            // Low Stock Products (stock < 10)
            $lowStockProducts = Product::with(['category', 'images' => function ($query) {
                $query->where('is_primary', true);
            }])
                ->where('stock', '<', 10)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'stock' => $product->stock,
                        'category' => $product->category ? $product->category->name : 'N/A',
                        'primary_image' => $product->images->first() ? '/storage/' . $product->images->first()->image_path : null,
                    ];
                });

            // Top Categories (by product count)
            $topCategories = Category::withCount('products')
                ->orderBy('products_count', 'desc')
                ->take(5)
                ->get()
                ->map(function ($category) {
                    return [
                        'name' => $category->name,
                        'product_count' => $category->products_count,
                    ];
                });

            // Recent Orders (last 5, delivered or shipped)
            $recentOrders = Order::with(['products' => function ($query) {
                $query->select('products.id', 'products.name');
            }, 'user'])
                ->whereIn('status', ['delivered', 'shipped'])
                ->latest()
                ->take(5)
                ->get();

            // Log raw products data for debugging
            Log::info('Admin Analytics: Raw Recent Orders Products', [
                'orders' => $recentOrders->map(function ($order) {
                    return [
                        'order_id' => $order->id,
                        'products' => $order->products->toArray(),
                    ];
                })->toArray(),
            ]);

            $recentOrders = $recentOrders->map(function ($order) {
                $products = $order->products->isEmpty()
                    ? [['name' => 'No Products Found', 'quantity' => 0]]
                    : $order->products->map(function ($product) {
                        return [
                            'name' => $product->name ?? 'Unknown Product',
                            'quantity' => $product->pivot->quantity ?? 1,
                        ];
                    })->toArray();

                return [
                    'id' => $order->id,
                    'user_name' => $order->user ? $order->user->name : 'N/A',
                    'total_amount' => (float) ($order->total_amount ?? 0),
                    'products' => $products,
                    'created_at' => $order->created_at->toDateTimeString(),
                ];
            });

            // Log mapped recent orders for debugging
            Log::info('Admin Analytics: Mapped Recent Orders', ['orders' => $recentOrders->toArray()]);

            // Sales Trend (last 30 days, all orders)
            $salesTrend = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => $item->date,
                        'total' => (float) $item->total,
                    ];
                });

            // Log sales trend for debugging
            Log::info('Admin Analytics: Sales Trend', ['sales_trend' => $salesTrend->toArray()]);

            // Top Products (by quantity sold)
            $topProducts = Product::join('order_product', 'products.id', '=', 'order_product.product_id')
                ->join('orders', 'order_product.order_id', '=', 'orders.id')
                ->whereIn('orders.status', ['delivered', 'shipped'])
                ->groupBy('products.id', 'products.name')
                ->select(
                    'products.id',
                    'products.name',
                    DB::raw('SUM(order_product.quantity) as total_quantity')
                )
                ->orderBy('total_quantity', 'desc')
                ->take(5)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'total_quantity' => (int) $product->total_quantity,
                    ];
                });

            return Inertia::render('Dashboard/Analytics', [
                'analytics' => [
                    'total_products' => $totalProducts,
                    'total_sales' => (float) $totalSales,
                    'low_stock_products' => $lowStockProducts,
                    'top_categories' => $topCategories,
                    'recent_orders' => $recentOrders,
                    'sales_trend' => $salesTrend,
                    'top_products' => $topProducts,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching analytics data', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Redirect::route('dashboard')->with('error', 'Failed to load analytics data');
        }
    }

    public function ProductDashboard(Request $request)
    {
        try {
            $perPage = 10; // Number of products per page
            $query = Product::with(['category', 'images' => function ($query) {
                $query->where('is_primary', true);
            }]);

            // Apply filters
            if ($id = $request->input('id')) {
                $query->where('id', $id);
            }

            if ($name = $request->input('name')) {
                $query->where('name', 'like', "%{$name}%");
            }

            if ($priceMin = $request->input('price_min')) {
                $query->where('price', '>=', $priceMin);
            }
            if ($priceMax = $request->input('price_max')) {
                $query->where('price', '<=', $priceMax);
            }

            if ($stockMin = $request->input('stock_min')) {
                $query->where('stock', '>=', $stockMin);
            }
            if ($stockMax = $request->input('stock_max')) {
                $query->where('stock', '<=', $stockMax);
            }

            if ($category = $request->input('category') && $request->input('category') != 'all') {
                $query->where('category_id', $category);
            }

            if ($ratingMin = $request->input('rating_min')) {
                $query->where('rating', '>=', $ratingMin);
            }
            if ($ratingMax = $request->input('rating_max')) {
                $query->where('rating', '<=', $ratingMax);
            }

            if ($discountMin = $request->input('discount_min')) {
                $query->where('discount', '>=', $discountMin);
            }
            if ($discountMax = $request->input('discount_max')) {
                $query->where('discount', '<=', $discountMax);
            }

            $products = $query->paginate($perPage)->withQueryString()
                ->through(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'stock' => $product->stock,
                        'category' => $product->category ? $product->category->name : 'N/A',
                        'rating' => $product->rating,
                        'discount' => $product->discount,
                        'primary_image' => $product->images->first() ? $product->images->first()->url : null,
                    ];
                });

            return Inertia::render('Products/Manage', [
                'products' => [
                    'data' => $products->items(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ],
                'categories' => Category::all()->map(function ($category) {
                    return ['id' => $category->id, 'name' => $category->name];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching products for management page', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return Redirect::route('dashboard.products')->with('error', 'Failed to load products');
        }
    }

    public function index(Request $request)
    {
        Log::info('ProductController::index called', $request->all());
        $query = Product::query()->with(['category', 'images']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category')) {
            $query->where('category_id', $categoryId);
        }

        if ($minPrice = $request->input('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        if ($request->input('in_stock')) {
            $query->where('stock', '>', 0);
        }

        if ($tags = $request->input('tags')) {
            $query->whereJsonContains('tags', $tags);
        }

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('Products/Browse', [
            'products' => $products,
            'categories' => Category::all(),
            'filters' => [
                'search' => $search,
                'category' => $categoryId ?? 'all',
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'in_stock' => $request->input('in_stock'),
                'tags' => $tags,
            ],
        ]);
    }

    public function create(Request $request, Product $product = null)
    {
        Log::info('ProductController::create called');
        if ($product && $product->user_id !== Auth::id()) {
            return redirect()->route('products.index')->with('error', 'Unauthorized to edit this product.');
        }

        if ($product) {
            $product->tags = $product->tags ?? [];
            $product->existing_images = $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'is_primary' => $image->is_primary,
                    'url' => Storage::url($image->image_path),
                ];
            })->toArray();
        }

        return Inertia::render('Products/Create', [
            'categories' => Category::all(),
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'category_id' => $product->category_id,
                'rating' => $product->rating,
                'tags' => $product->tags,
                'discount' => $product->discount,
                'existing_images' => $product->existing_images,
                'primary_image_index' => $product->images->search(fn($img) => $img->is_primary) ?? 0,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('ProductController::store called', $request->all());

        try {
            $tags = $request->input('tags', []);
            if (is_string($tags)) {
                $tags = json_decode($tags, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid tags JSON format');
                }
            }
            $tags = is_array($tags) ? array_map('strtolower', array_map('trim', $tags)) : [];

            $request->merge(['tags' => $tags]);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'rating' => 'nullable|numeric|min:0|max:5',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'discount' => 'nullable|integer|min:0|max:100',
                'images' => 'required|array|min:1',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
                'primary_image_index' => 'nullable|integer|min:0',
            ]);

            $product = Product::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'price' => $request->input('price'),
                'stock' => $request->input('stock'),
                'category_id' => $request->input('category_id'),
                'user_id' => Auth::id(),
                'rating' => $request->input('rating', 0),
                'tags' => $tags,
                'discount' => $request->input('discount'),
            ]);

            $primaryIndex = $request->input('primary_image_index', 0);
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('product_images', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary' => $index === $primaryIndex,
                ]);
            }

            session()->flash('success', 'Product created successfully');
            return redirect()->route('products.index')->with('success', 'Product created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->with('error', 'Failed to create product');
        } catch (\Exception $e) {
            Log::error('Error in store', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    public function show(Request $request, $id)
    {
        Log::info('ProductController::show called', ['id' => $id]);
        $product = Product::with(['category', 'images', 'orders', 'recommendations'])->findOrFail($id);

        return Inertia::render('Products/Show', [
            'product' => $product,
            'auth' => ['user' => Auth::user()],
        ]);
    }

    public function update(Request $request, Product $product)
    {
        Log::info('ProductController::update called', $request->all());

        if ($product->user_id !== Auth::id()) {
            return redirect()->route('products.index')->with('error', 'Unauthorized to edit this product.');
        }

        try {
            $tags = $request->input('tags', []);
            if (is_string($tags)) {
                $tags = json_decode($tags, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid tags JSON format');
                }
            }
            $tags = is_array($tags) ? array_map('strtolower', array_map('trim', $tags)) : [];

            $request->merge(['tags' => $tags]);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'rating' => 'nullable|numeric|min:0|max:5',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'discount' => 'nullable|integer|min:0|max:100',
                'images' => 'sometimes|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
                'primary_image_index' => 'nullable|integer|min:0',
                'existing_images' => 'sometimes|array',
                'existing_images.*.id' => 'exists:product_images,id',
                'existing_images.*.is_primary' => 'boolean',
            ]);

            $product->update([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'price' => $request->input('price'),
                'stock' => $request->input('stock'),
                'category_id' => $request->input('category_id'),
                'rating' => $request->input('rating', $product->rating),
                'tags' => $tags,
                'discount' => $request->input('discount'),
            ]);

            // Reset all images to non-primary
            ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);

            // Handle existing images
            if ($request->has('existing_images')) {
                foreach ($request->input('existing_images', []) as $index => $imageData) {
                    $image = ProductImage::find($imageData['id']);
                    if ($image) {
                        $image->update(['is_primary' => $index === (int)$request->input('primary_image_index', 0)]);
                    }
                }
            }

            // Handle new images
            if ($request->hasFile('images')) {
                $primaryIndex = $request->input('primary_image_index', 0);
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('product_images', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'is_primary' => $index === $primaryIndex,
                    ]);
                }
            }

            session()->flash('success', 'Product updated successfully');
            return redirect()->route('products.show', $product->id)->with('success', 'Product updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput()->with('error', 'Failed to update product');
        } catch (\Exception $e) {
            Log::error('Error in update', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Failed to update product: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Product $product)
    {
        Log::info('ProductController::destroy called', ['product_id' => $product->id]);

        if ($product->user_id !== Auth::id()) {
            return redirect()->route('dashboard.products')->with('error', 'Unauthorized to delete this product.');
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $product->delete();

        session()->flash('success', 'Product deleted successfully');
        return redirect()->route('dashboard.products')->with('success', 'Product deleted successfully');
    }
}
