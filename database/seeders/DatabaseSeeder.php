<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Recommendation;
use App\Models\ChatMessage;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Users
        $usersData = json_decode(File::get(database_path('seeders/data/users.json')), true);
        foreach ($usersData as $userData) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'phone' => $userData['phone'],
                'address' => $userData['address'],
                'is_admin' => $userData['is_admin'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed Categories
        $categoriesData = json_decode(File::get(database_path('seeders/data/categories.json')), true);
        foreach ($categoriesData as $categoryData) {
            Category::create([
                'id' => $categoryData['id'],
                'name' => $categoryData['name'],
                'description' => $categoryData['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed Products and Images
        $productsData = json_decode(File::get(database_path('seeders/data/products.json')), true);
        $products = collect();
        foreach ($productsData as $index => $productData) {
            $product = Product::create([
                'name' => $productData['name'],
                'description' => $productData['description'],
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'category_id' => $productData['category_id'],
                'rating' => $productData['rating'],
                'tags' => $productData['tags'],
                'discount' => $productData['discount'],
                'user_id' => $productData['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Seed 3 images per product
            $productIndex = $index + 1;
            for ($i = 1; $i <= 3; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => "product_images/product_{$productIndex}_{$i}.png",
                    'is_primary' => $i === 1, // First image is primary
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $products->push($product);
        }

        // Seed Orders
        $ordersData = json_decode(File::get(database_path('seeders/data/orders.json')), true);
        $orders = collect();
        foreach ($ordersData as $orderData) {
            $order = Order::create([
                'user_id' => $orderData['user_id'],
                'total_amount' => $orderData['total_amount'],
                'status' => $orderData['status'],
                'shipping_address' => $orderData['shipping_address'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $orders->push($order);
        }

        // Seed Order-Product Relationships
        $orderProductData = json_decode(File::get(database_path('seeders/data/order_product.json')), true);
        foreach ($orderProductData as $data) {
            DB::table('order_product')->insert([
                'order_id' => $data['order_id'],
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed Recommendations
        $recommendationsData = json_decode(File::get(database_path('seeders/data/recommendations.json')), true);
        foreach ($recommendationsData as $recommendationData) {
            Recommendation::create([
                'user_id' => $recommendationData['user_id'],
                'product_id' => $recommendationData['product_id'],
                'score' => $recommendationData['score'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed Chat Messages
        $chatMessagesData = json_decode(File::get(database_path('seeders/data/chat_messages.json')), true);
        foreach ($chatMessagesData as $chatMessageData) {
            ChatMessage::create([
                'user_id' => $chatMessageData['user_id'],
                'message' => $chatMessageData['message'],
                'is_from_bot' => $chatMessageData['is_bot'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
