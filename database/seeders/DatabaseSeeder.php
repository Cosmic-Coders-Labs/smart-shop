<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Recommendation;
use App\Models\ChatMessage;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Static Users
        $users = collect([
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
                'phone' => '555-000-0001',
                'address' => '123 Admin St, City, Country',
                'is_admin' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]),
            User::create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password'),
                'phone' => '555-123-4567',
                'address' => '456 Main St, City, Country',
                'is_admin' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]),
            User::create([
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password'),
                'phone' => '555-234-5678',
                'address' => '789 Oak St, City, Country',
                'is_admin' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]),
            User::create([
                'name' => 'Alice Johnson',
                'email' => 'alice@example.com',
                'password' => Hash::make('password'),
                'phone' => '555-345-6789',
                'address' => '321 Pine St, City, Country',
                'is_admin' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]),
            User::create([
                'name' => 'Bob Wilson',
                'email' => 'bob@example.com',
                'password' => Hash::make('password'),
                'phone' => '555-456-7890',
                'address' => '654 Elm St, City, Country',
                'is_admin' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]),
        ]);

        // Seed Categories
        $categories = collect([
            Category::create(['name' => 'Electronics', 'description' => 'Gadgets and tech accessories']),
            Category::create(['name' => 'Clothing', 'description' => 'Apparel and accessories']),
            Category::create(['name' => 'Home', 'description' => 'Home appliances and decor']),
            Category::create(['name' => 'Books', 'description' => 'Fiction, non-fiction, and more']),
            Category::create(['name' => 'Toys', 'description' => 'Games and toys for all ages']),
        ]);

        // Seed Products from JSON
        $productsData = json_decode(File::get(database_path('seeders/data/products.json')), true);
        $products = collect();
        foreach ($productsData as $productData) {
            $product = Product::create([
                'name' => $productData['name'],
                'description' => $productData['description'],
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'category_id' => $productData['category_id'],
                'image_url' => $productData['image_url'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $products->push($product);
        }

        // Create 20 orders, each with 1-5 products, linked to static users
        $orders = Order::factory()->count(20)->create([
            'user_id' => fn() => $users->random()->id,
        ])->each(function ($order) use ($products) {
            $orderProducts = $products->random(rand(1, 5))->pluck('id')->mapWithKeys(function ($productId) {
                return [$productId => ['quantity' => rand(1, 3)]];
            });
            $order->products()->sync($orderProducts);

            // Recalculate total_amount
            $totalAmount = $order->products()->get()->sum(function ($product) {
                return $product->price * $product->pivot->quantity;
            });
            $order->update(['total_amount' => $totalAmount]);
        });

        // Create 100 recommendations
        Recommendation::factory()->count(100)->create([
            'user_id' => fn() => $users->random()->id,
            'product_id' => fn() => $products->random()->id,
        ]);

        // Create 50 chat messages
        ChatMessage::factory()->count(50)->create([
            'user_id' => fn() => $users->random()->id,
        ]);
    }
}
