<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Cart;
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
        $userIds = [];
        foreach ($usersData as $userData) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'phone' => $userData['phone'],
                'address' => $userData['address'],
                'is_admin' => $userData['is_admin'],
                'role' => $userData['role'] ?? 'customer',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $userIds[] = $user->id;
        }

        // Seed Categories
        $categoriesData = json_decode(File::get(database_path('seeders/data/categories.json')), true);
        $categoryIds = [];
        foreach ($categoriesData as $categoryData) {
            $category = Category::create([
                'id' => $categoryData['id'],
                'name' => $categoryData['name'],
                'description' => $categoryData['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $categoryIds[] = $category->id;
        }

        // Seed Products and Images
        $productsData = json_decode(File::get(database_path('seeders/data/products.json')), true);
        $products = collect();
        foreach ($productsData as $index => $productData) {
            if (!in_array($productData['category_id'], $categoryIds) || !in_array($productData['user_id'], $userIds)) {
                continue; // Skip invalid foreign keys
            }
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
                    'is_primary' => $i === 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $products->push($product);
        }

        $productIds = $products->pluck('id')->toArray();

        // Seed Orders and Order-Product
        $ordersData = json_decode(File::get(database_path('seeders/data/orders.json')), true);
        $orderProductData = json_decode(File::get(database_path('seeders/data/order_product.json')), true);
        $orders = collect();
        foreach ($ordersData as $orderData) {
            if (!in_array($orderData['user_id'], $userIds)) {
                continue; // Skip invalid user_id
            }
            $order = Order::create([
                'user_id' => $orderData['user_id'],
                'total_amount' => $orderData['total_amount'],
                'status' => $orderData['status'],
                'shipping_address' => $orderData['shipping_address'],
                'created_at' => $orderData['created_at'] ?? now(),
                'updated_at' => now(),
            ]);

            // Attach products
            $orderProducts = collect($orderProductData)->where('order_id', $order->id);
            foreach ($orderProducts as $data) {
                if (in_array($data['product_id'], $productIds)) {
                    DB::table('order_product')->insert([
                        'order_id' => $order->id,
                        'product_id' => $data['product_id'],
                        'quantity' => $data['quantity'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
            $orders->push($order);
        }

        // Seed Cart
        $cartData = json_decode(File::get(database_path('seeders/data/cart.json')), true);
        foreach ($cartData as $cartItem) {
            if (in_array($cartItem['user_id'], $userIds) && in_array($cartItem['product_id'], $productIds)) {
                Cart::create([
                    'user_id' => $cartItem['user_id'],
                    'product_id' => $cartItem['product_id'],
                    'quantity' => $cartItem['quantity'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed Recommendations
        $recommendationsData = json_decode(File::get(database_path('seeders/data/recommendations.json')), true);
        foreach ($recommendationsData as $recommendationData) {
            if (in_array($recommendationData['user_id'], $userIds) && in_array($recommendationData['product_id'], $productIds)) {
                Recommendation::create([
                    'user_id' => $recommendationData['user_id'],
                    'product_id' => $recommendationData['product_id'],
                    'score' => $recommendationData['score'],
                    'reason' => $recommendationData['reason'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed Chat Messages
        $chatMessagesData = json_decode(File::get(database_path('seeders/data/chat_messages.json')), true);
        foreach ($chatMessagesData as $chatMessageData) {
            if (in_array($chatMessageData['user_id'], $userIds)) {
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
}
