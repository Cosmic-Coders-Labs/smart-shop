import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ProductsPageProps } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Products',
        href: route('products.index'),
    },
];

const ProductBrowsePage = ({ products, categories, filters, flash }: ProductsPageProps) => {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [inStock, setInStock] = useState(filters.in_stock || false);
    const [tags, setTags] = useState(filters.tags || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Handle flash messages
    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Handle filter submission
    const handleFilterSubmit = () => {
        router.get(
            route('products.index'),
            {
                search,
                category: category === 'all' ? '' : category,
                min_price: minPrice,
                max_price: maxPrice,
                in_stock: inStock ? '1' : '',
                tags,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Handle add to cart
    const handleAddToCart = (productId: number) => {
        router.post(
            route('cart.store'),
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveState: false, // Allow redirect to cart page
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Product added to cart successfully');
                    router.visit(route('cart.index')); // Ensure redirect to cart page
                },
                onError: (errors) => {
                    toast.error(errors.quantity || 'Failed to add product to cart');
                },
            },
        );
    };

    // Parse pagination links
    const currentPage = products.links.findIndex((link) => link.active);
    const totalPages = products.links.filter((link) => !isNaN(parseInt(link.label))).length;
    const pageLinks = products.links
        .filter((link) => !isNaN(parseInt(link.label))) // Only numbered pages
        .slice(Math.max(0, currentPage - 2), currentPage + 3); // Show 2 pages before and after current

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <Head title="Products - SmartShop" />
            <h1 className="text-primary mb-8 text-3xl font-bold">Browse Products</h1>

            {/* Filters */}
            <div className="mb-8">
                <Button
                    className="bg-primary text-primary-foreground hover:bg-primary-dark mb-4 md:hidden"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <div className={`${isFilterOpen ? 'block' : 'hidden'} bg-card rounded-lg p-6 shadow-md md:block`}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label htmlFor="search" className="text-foreground">
                                Search
                            </Label>
                            <Input
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="bg-input text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="category" className="text-foreground">
                                Category
                            </Label>
                            <Select value={category.toString()} onValueChange={setCategory}>
                                <SelectTrigger className="bg-input text-foreground">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="min_price" className="text-foreground">
                                Min Price
                            </Label>
                            <Input
                                id="min_price"
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="Min price"
                                className="bg-input text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="max_price" className="text-foreground">
                                Max Price
                            </Label>
                            <Input
                                id="max_price"
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="Max price"
                                className="bg-input text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="in_stock" className="text-foreground">
                                In Stock
                            </Label>
                            <input
                                id="in_stock"
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                                className="text-primary focus:ring-primary h-4 w-4"
                            />
                        </div>
                        <div>
                            <Label htmlFor="tags" className="text-foreground">
                                Tags
                            </Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., electronics, sale"
                                className="bg-input text-foreground"
                            />
                        </div>
                    </div>
                    <Button onClick={handleFilterSubmit} className="bg-primary text-primary-foreground hover:bg-primary-dark mt-4">
                        Apply Filters
                    </Button>
                </div>
            </div>

            {/* Product Grid */}
            {products.data.length === 0 ? (
                <p className="text-muted-foreground text-center">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.data.map((product) => (
                        <Card key={product.id} className="bg-card text-card-foreground py-0 pb-4">
                            <CardHeader className="px-0">
                                <Link href={route('products.show', product.id)}>
                                    <img
                                        src={
                                            product.images.find((img) => img.is_primary)?.image_path
                                                ? `/storage/${product.images.find((img) => img.is_primary).image_path}`
                                                : product.images[0]?.image_path
                                                  ? `/storage/${product.images[0].image_path}`
                                                  : 'https://via.placeholder.com/300'
                                        }
                                        alt={product.name}
                                        className="h-48 w-full rounded-lg object-contain"
                                    />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg font-semibold">
                                    <Link href={route('products.show', product.id)} className="hover:underline">
                                        {product.name}
                                    </Link>
                                </CardTitle>
                                <p className="text-muted-foreground text-sm">{product.category.name}</p>
                                <p className="text-foreground font-bold">
                                    ${product.discount ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price.toFixed(2)}
                                    {product.discount && <span className="text-destructive ml-2 line-through">${product.price.toFixed(2)}</span>}
                                </p>
                                <p className="text-muted-foreground text-sm">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => handleAddToCart(product.id)}
                                    className="bg-primary text-primary-foreground hover:bg-primary-dark w-full"
                                    disabled={product.stock === 0}
                                >
                                    Add to Cart
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {products.links.length > 3 && (
                <div className="mt-8 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={products.links.find((link) => link.label.includes('Previous'))?.url || '#'}
                                    className={
                                        !products.links.find((link) => link.label.includes('Previous'))?.url ? 'pointer-events-none opacity-50' : ''
                                    }
                                />
                            </PaginationItem>
                            {pageLinks.map((link, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href={link.url || '#'}
                                        isActive={link.active}
                                        className={link.active ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={products.links.find((link) => link.label.includes('Next'))?.url || '#'}
                                    className={
                                        !products.links.find((link) => link.label.includes('Next'))?.url ? 'pointer-events-none opacity-50' : ''
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </AppLayout>
    );
};

export default ProductBrowsePage;
