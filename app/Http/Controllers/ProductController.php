<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
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

    public function create(Request $request)
    {
        Log::info('ProductController::create called');
        $product = null;
        if ($id = $request->query('edit')) {
            $product = Product::with('images')->findOrFail($id);
            if ($product->user_id !== auth()->id()) {
                return redirect()->route('products.index')->with('error', 'Unauthorized to edit this product.');
            }
        }
        return Inertia::render('Products/Create', [
            'categories' => Category::all(),
            'product' => $product,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('ProductController::store called', $request->all());

        try {
            // Parse tags if sent as JSON string
            $tags = $request->input('tags', []);
            if (is_string($tags)) {
                $tags = json_decode($tags, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid tags JSON format');
                }
            }
            $tags = is_array($tags) ? array_map('strtolower', array_map('trim', $tags)) : [];
            Log::info('Processed tags', ['tags' => $tags]);

            // Merge parsed tags back into the request
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
            Log::info('Validation passed', $validated);

            $product = Product::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'price' => $request->input('price'),
                'stock' => $request->input('stock'),
                'category_id' => $request->input('category_id'),
                'user_id' => auth()->id(), // Assign authenticated user as owner
                'rating' => $request->input('rating', 0),
                'tags' => $tags,
                'discount' => $request->input('discount'),
            ]);
            Log::info('Product created', ['product_id' => $product->id]);

            $primaryIndex = $request->input('primary_image_index', 0);
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('product_images', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary' => $index === $primaryIndex,
                ]);
            }
            Log::info('Images stored');

            Log::info('Setting flash success for product store', ['message' => 'Product created successfully']);
            Log::info('Session data before flash', session()->all());
            session()->flash('success', 'Product created successfully');
            Log::info('Session data after flash', session()->all());

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
        $product = Product::with(['category', 'images', 'orders', 'recommendations'])->find($id);

        if (!$product) {
            Log::info('Product not found', ['id' => $id]);
            return redirect()->route('products.index')->with('error', 'Product not found.');
        }

        return Inertia::render('Products/Show', [
            'product' => $product,
            'auth' => ['user' => auth()->user()], // Pass authenticated user
        ]);
    }

    public function update(Request $request, Product $product)
    {
        Log::info('ProductController::update called', $request->all());

        // Check if user is the owner
        if ($product->user_id !== auth()->id()) {
            return redirect()->route('products.index')->with('error', 'Unauthorized to edit this product.');
        }

        try {
            // Parse tags if sent as JSON string
            $tags = $request->input('tags', []);
            if (is_string($tags)) {
                $tags = json_decode($tags, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid tags JSON format');
                }
            }
            $tags = is_array($tags) ? array_map('strtolower', array_map('trim', $tags)) : [];
            Log::info('Processed tags', ['tags' => $tags]);

            // Merge parsed tags back into the request
            $request->merge(['tags' => $tags]);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|numeric|min:0',
                'stock' => 'sometimes|integer|min:0',
                'category_id' => 'sometimes|exists:categories,id',
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
            Log::info('Validation passed', $validated);

            $product->update([
                'name' => $request->input('name', $product->name),
                'description' => $request->input('description', $product->description),
                'price' => $request->input('price', $product->price),
                'stock' => $request->input('stock', $product->stock),
                'category_id' => $request->input('category_id', $product->category_id),
                'rating' => $request->input('rating', $product->rating),
                'tags' => $tags ?: $product->tags,
                'discount' => $request->input('discount', $product->discount),
            ]);
            Log::info('Product updated', ['product_id' => $product->id]);

            if ($request->has('existing_images')) {
                foreach ($request->input('existing_images', []) as $imageData) {
                    $image = ProductImage::find($imageData['id']);
                    if ($image) {
                        $image->update(['is_primary' => $imageData['is_primary'] ?? false]);
                    }
                }
            }

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
            Log::info('Images updated');

            Log::info('Setting flash success for product update', ['message' => 'Product updated successfully']);
            Log::info('Session data before flash', session()->all());
            session()->flash('success', 'Product updated successfully');
            Log::info('Session data after flash', session()->all());

            return redirect()->route('products.show', $product->id)->with('success', 'Product updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->with('error', 'Failed to update product');
        } catch (\Exception $e) {
            Log::error('Error in update', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Failed to update product: ' . $e->getMessage());
        }
    }

    public function destroy(Product $product)
    {
        Log::info('ProductController::destroy called', ['product_id' => $product->id]);

        // Check if user is the owner
        if ($product->user_id !== auth()->id()) {
            return redirect()->route('products.index')->with('error', 'Unauthorized to delete this product.');
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $product->delete();

        Log::info('Setting flash success for product destroy', ['message' => 'Product deleted successfully']);
        Log::info('Session data before flash', session()->all());
        session()->flash('success', 'Product deleted successfully');
        Log::info('Session data after flash', session()->all());

        return redirect()->route('products.index')->with('success', 'Product deleted successfully');
    }
}
