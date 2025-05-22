import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Filter, Search, Tag, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Image {
    url: string;
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    rating: number;
    discount: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    flash?: { success?: string; error?: string };
}

const ProductManagementPage: React.FC = () => {
    const { products, categories, flash } = usePage<PageProps>().props;
    const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        id: '',
        name: '',
        price_min: '',
        price_max: '',
        stock_min: '',
        stock_max: '',
        category: '',
        rating_min: '',
        rating_max: '',
        discount_min: '',
        discount_max: '',
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Sync filters with URL query parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFilters({
            id: params.get('id') || '',
            name: params.get('name') || '',
            price_min: params.get('price_min') || '',
            price_max: params.get('price_max') || '',
            stock_min: params.get('stock_min') || '',
            stock_max: params.get('stock_max') || '',
            category: params.get('category') || '',
            rating_min: params.get('rating_min') || '',
            rating_max: params.get('rating_max') || '',
            discount_min: params.get('discount_min') || '',
            discount_max: params.get('discount_max') || '',
        });
    }, []);

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value === 'all' ? '' : value };
        setFilters(newFilters);

        // Build query parameters
        const params: { [key: string]: string } = { page: products.current_page.toString() };
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params[k] = v;
        });

        router.visit(route('dashboard.products', params), {
            preserveState: true,
            preserveScroll: true,
            only: ['products', 'categories'],
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            id: '',
            name: '',
            price_min: '',
            price_max: '',
            stock_min: '',
            stock_max: '',
            category: '',
            rating_min: '',
            rating_max: '',
            discount_min: '',
            discount_max: '',
        });

        router.visit(route('dashboard.products', { page: products.current_page }), {
            preserveState: true,
            preserveScroll: true,
            only: ['products', 'categories'],
        });
    };

    // Open delete confirmation dialog
    const confirmDelete = (productId: number) => {
        setDeleteProductId(productId);
        setIsDeleteDialogOpen(true);
    };

    // Handle product deletion
    const handleDelete = () => {
        if (!deleteProductId) return;

        router.delete(route('products.destroy', deleteProductId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Product deleted successfully');
                setIsDeleteDialogOpen(false);
                setDeleteProductId(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                toast.error(errors.error || 'Failed to delete product');
                setIsDeleteDialogOpen(false);
                setDeleteProductId(null);
            },
        });
    };

    // Handle page navigation
    const changePage = (page: number) => {
        if (page < 1 || page > products.last_page || page === products.current_page) return;

        const params: { [key: string]: string } = { page: page.toString() };
        Object.entries(filters).forEach(([k, v]) => {
            if (v) params[k] = v;
        });

        router.visit(route('dashboard.products', params), {
            preserveState: true,
            preserveScroll: true,
            only: ['products', 'categories'],
        });
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        const currentPage = products.current_page;
        const totalPages = products.last_page;

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Products', href: route('products.index') },
                { title: 'Manage Products', href: '#' },
            ]}
            className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4"
        >
            <Head title="Manage Products" />
            <div className="flex items-center justify-between">
                <h1 className="text-primary text-3xl font-bold">Manage Products</h1>
                <Button
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 flex items-center gap-2 rounded-full"
                    onClick={clearFilters}
                    aria-label="Clear all filters"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Filter Card */}
            <div className="mb-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Label htmlFor="filter-id" className="text-sm font-medium text-gray-700">
                            ID
                        </Label>
                        <div className="relative mt-1">
                            <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                            <Input
                                id="filter-id"
                                type="number"
                                value={filters.id}
                                onChange={(e) => handleFilterChange('id', e.target.value)}
                                placeholder="Filter ID"
                                className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                min="1"
                                aria-label="Filter by product ID"
                                title="Enter a product ID to filter"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="filter-name" className="text-sm font-medium text-gray-700">
                            Name
                        </Label>
                        <div className="relative mt-1">
                            <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                            <Input
                                id="filter-name"
                                type="text"
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                placeholder="Filter Name"
                                className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                aria-label="Filter by product name"
                                title="Enter a product name to filter"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Price</Label>
                        <div className="mt-1 flex gap-2">
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.price_min}
                                    onChange={(e) => handleFilterChange('price_min', e.target.value)}
                                    placeholder="Min"
                                    min="0"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by minimum price"
                                    title="Enter minimum price"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.price_max}
                                    onChange={(e) => handleFilterChange('price_max', e.target.value)}
                                    placeholder="Max"
                                    min="0"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by maximum price"
                                    title="Enter maximum price"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Stock</Label>
                        <div className="mt-1 flex gap-2">
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.stock_min}
                                    onChange={(e) => handleFilterChange('stock_min', e.target.value)}
                                    placeholder="Min"
                                    min="0"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by minimum stock"
                                    title="Enter minimum stock"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.stock_max}
                                    onChange={(e) => handleFilterChange('stock_max', e.target.value)}
                                    placeholder="Max"
                                    min="0"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by maximum stock"
                                    title="Enter maximum stock"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="filter-category" className="text-sm font-medium text-gray-700">
                            Category
                        </Label>
                        <div className="relative mt-1">
                            <Tag size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                            <Select
                                value={filters.category}
                                onValueChange={(value) => handleFilterChange('category', value)}
                                aria-label="Filter by category"
                            >
                                <SelectTrigger
                                    id="filter-category"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                >
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Rating</Label>
                        <div className="mt-1 flex gap-2">
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.rating_min}
                                    onChange={(e) => handleFilterChange('rating_min', e.target.value)}
                                    placeholder="Min"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by minimum rating"
                                    title="Enter minimum rating (0-5)"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.rating_max}
                                    onChange={(e) => handleFilterChange('rating_max', e.target.value)}
                                    placeholder="Max"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by maximum rating"
                                    title="Enter maximum rating (0-5)"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Discount</Label>
                        <div className="mt-1 flex gap-2">
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.discount_min}
                                    onChange={(e) => handleFilterChange('discount_min', e.target.value)}
                                    placeholder="Min"
                                    min="0"
                                    max="100"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by minimum discount"
                                    title="Enter minimum discount (0-100%)"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Filter size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                                <Input
                                    type="number"
                                    value={filters.discount_max}
                                    onChange={(e) => handleFilterChange('discount_max', e.target.value)}
                                    placeholder="Max"
                                    min="0"
                                    max="100"
                                    className="focus:ring-primary focus:border-primary w-full rounded-md border-gray-300 pl-10 text-sm"
                                    aria-label="Filter by maximum discount"
                                    title="Enter maximum discount (0-100%)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="mb-4 overflow-x-auto rounded-lg border bg-white p-6 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.rating.toFixed(1)}</TableCell>
                                    <TableCell>{product.discount}%</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => router.visit(route('products.edit', product.id))}>
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => router.visit(route('products.show', product.id))}>
                                                View
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => confirmDelete(product.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {products.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {products.per_page * (products.current_page - 1) + 1} to{' '}
                        {Math.min(products.per_page * products.current_page, products.total)} of {products.total} products
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(products.current_page - 1)}
                            disabled={products.current_page === 1}
                        >
                            Previous
                        </Button>
                        {getPageNumbers().map((page) => (
                            <Button
                                key={page}
                                variant={page === products.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => changePage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(products.current_page + 1)}
                            disabled={products.current_page === products.last_page}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the product.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteProductId(null)}>No</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default ProductManagementPage;
