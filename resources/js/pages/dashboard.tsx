import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface Order {
    id: number;
    total_amount: number | null;
    status: string;
    products: { name: string; quantity: number }[];
    created_at: string;
}

interface CartItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface Recommendation {
    product_id: number;
    product_name: string;
    score: number | null; // Allow null
    reason: string;
}

interface PageProps {
    user: { name: string };
    recent_orders: Order[];
    cart_items: CartItem[];
    recommendations: Recommendation[];
    flash?: { success?: string; error?: string };
}

const CustomerDashboard: React.FC = () => {
    const { user, recent_orders, cart_items, recommendations, flash } = usePage<PageProps>().props;
    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Calculate cart total
    const cartTotal = cart_items.reduce((total, item) => total + item.quantity * item.price, 0);

    // Format total_amount safely
    const formatTotal = (total: number | null): string => {
        return typeof total === 'number' && !isNaN(total) ? `$${total.toFixed(2)}` : '$0.00';
    };

    // Format score safely
    const formatScore = (score: number | null): string => {
        return typeof score === 'number' && !isNaN(score) ? score.toFixed(2) : '0.00';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('dashboard') }]} className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <Head title="Customer Dashboard - SmartShop" />
            <h1 className="text-primary mb-8 text-3xl font-bold">Welcome, {user.name}!</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Cart Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{cart_items.length}</p>
                        <Link href={route('cart.index')}>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">View Cart</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{recent_orders.length}</p>
                        <Link href={route('orders.index')}>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">View Orders</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{recommendations.length}</p>
                        <Link href={route('recommendations.user')}>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">View Recommendations</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent_orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No recent orders.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recent_orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.products.map((p) => `${p.name} (x${p.quantity})`).join(', ')}</TableCell>
                                        <TableCell>{formatTotal(order.total_amount)}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Cart Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Cart Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart_items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        Your cart is empty.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cart_items.map((item) => (
                                    <TableRow key={item.product_id}>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.price.toFixed(2)}</TableCell>
                                        <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {cart_items.length > 0 && (
                        <div className="mt-4 flex justify-end">
                            <p className="text-lg font-bold">Total: ${cartTotal.toFixed(2)}</p>
                        </div>
                    )}
                    <div className="mt-4">
                        <Link href={route('cart.index')}>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Manage Cart</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle>Recommended for You</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recommendations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No recommendations available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recommendations.map((rec) => (
                                    <TableRow key={rec.product_id}>
                                        <TableCell>{rec.product_name}</TableCell>
                                        <TableCell>{rec.reason || 'Based on your preferences'}</TableCell>
                                        <TableCell>{formatScore(rec.score)}</TableCell>
                                        <TableCell>
                                            <Link href={route('products.show', rec.product_id)}>
                                                <Button variant="outline">View Product</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Link href={route('products.index')}>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Products</Button>
                    </Link>
                    <Link href={route('orders.index')}>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">View All Orders</Button>
                    </Link>
                    <Link href={route('recommendations.user')}>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">More Recommendations</Button>
                    </Link>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default CustomerDashboard;
