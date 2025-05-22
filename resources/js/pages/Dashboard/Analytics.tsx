import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface AnalyticsData {
    total_products: number;
    total_sales: number;
    low_stock_products: { id: number; name: string; stock: number; category: string; primary_image: string | null }[];
    top_categories: { name: string; product_count: number }[];
    recent_orders: { id: number; user_name: string; total_amount: number; products: { name: string; quantity: number }[]; created_at: string }[];
    sales_trend: { date: string; total: number }[];
    top_products: { id: number; name: string; total_quantity: number }[];
}

interface PageProps {
    analytics: AnalyticsData;
    flash?: { success?: string; error?: string };
}

const AdminAnalyticsPage: React.FC = () => {
    const { analytics, flash } = usePage<PageProps>().props;

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Sales Trend Chart Data
    const salesTrendData = {
        labels: analytics.sales_trend.map((item) => item.date),
        datasets: [
            {
                label: 'Daily Sales ($)',
                data: analytics.sales_trend.map((item) => item.total),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
            },
        ],
    };

    // Top Categories Chart Data
    const topCategoriesData = {
        labels: analytics.top_categories.map((cat) => cat.name),
        datasets: [
            {
                label: 'Product Count',
                data: analytics.top_categories.map((cat) => cat.product_count),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard.analytics') },
                { title: 'Analytics', href: '#' },
            ]}
            className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4"
        >
            <Head title="Admin Analytics - SmartShop" />
            <h1 className="text-primary mb-8 text-3xl font-bold">Product Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{analytics.total_products}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">${analytics.total_sales.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{analytics.low_stock_products.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line data={salesTrendData} options={chartOptions} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={topCategoriesData} options={chartOptions} />
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.low_stock_products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No low stock products.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analytics.low_stock_products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.primary_image ? (
                                                <img src={product.primary_image} alt={product.name} className="h-12 w-12 rounded object-cover" />
                                            ) : (
                                                'No image'
                                            )}
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                                <TableHead>User</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.recent_orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No recent orders.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analytics.recent_orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.user_name}</TableCell>
                                        <TableCell>{order.products.map((p) => `${p.name} (x${p.quantity})`).join(', ')}</TableCell>
                                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Quantity Sold</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.top_products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        No sales data available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analytics.top_products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.total_quantity}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default AdminAnalyticsPage;
