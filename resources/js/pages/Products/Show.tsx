import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ProductPageProps } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Products',
        href: route('products.index'),
    },
    {
        title: 'Product Details',
        href: '#',
    },
];

const ProductShowPage: React.FC = () => {
    const { product, auth, flash } = usePage<
        ProductPageProps & { auth: { user: { id: number } | null }; flash: { success?: string; error?: string } }
    >().props;

    // State for current image index
    const [currentImageIndex, setCurrentImageIndex] = useState(
        product.images.findIndex((img) => img.is_primary) !== -1 ? product.images.findIndex((img) => img.is_primary) : 0,
    );

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Handle next/previous buttons
    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    // Handle thumbnail click
    const handleThumbnailClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    // Handle add to cart
    const handleAddToCart = () => {
        router.post(
            route('cart.store'),
            {
                product_id: product.id,
                quantity: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Handle edit button click
    const handleEdit = () => {
        router.get(route('products.create', { edit: product.id }));
    };

    // Get current image URL
    const currentImage = product.images[currentImageIndex]?.image_path
        ? `/storage/${product.images[currentImageIndex].image_path}`
        : 'https://via.placeholder.com/300';

    return (
        <AppLayout breadcrumbs={breadcrumbs} className={'flex h-full flex-1 flex-col gap-4 rounded-xl p-4'}>
            <Head title={`${product.name} - SmartShop`} />
            <h1 className="text-primary mb-8 text-3xl font-bold">{product.name}</h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Image Gallery */}
                <Card className="bg-card text-card-foreground">
                    <CardHeader>
                        <div className="relative">
                            {/* Main Image */}
                            <img src={currentImage} alt={product.name} className="h-96 w-full rounded-lg object-cover" />
                            {/* Next/Previous Buttons */}
                            {product.images.length > 1 && (
                                <>
                                    <Button
                                        onClick={handlePrevImage}
                                        className="bg-primary/80 text-primary-foreground hover:bg-primary absolute top-1/2 left-2 -translate-y-1/2"
                                        size="icon"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M15 18l-6-6 6-6" />
                                        </svg>
                                    </Button>
                                    <Button
                                        onClick={handleNextImage}
                                        className="bg-primary/80 text-primary-foreground hover:bg-primary absolute top-1/2 right-2 -translate-y-1/2"
                                        size="icon"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <CardContent className="flex justify-center space-x-2">
                            {product.images.map((img, index) => (
                                <img
                                    key={img.id}
                                    src={`/storage/${img.image_path}`}
                                    alt="Thumbnail"
                                    className={`h-16 w-16 cursor-pointer rounded border-2 object-cover ${
                                        index === currentImageIndex ? 'border-primary' : 'border-border'
                                    }`}
                                    onClick={() => handleThumbnailClick(index)}
                                />
                            ))}
                        </CardContent>
                    )}
                </Card>

                {/* Product Details */}
                <Card className="bg-card text-card-foreground">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">Category: {product.category.name}</p>
                        <p className="text-foreground text-lg font-bold">
                            ${product.discount ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price.toFixed(2)}
                            {product.discount ? <span className="text-destructive ml-2 line-through">${product.price.toFixed(2)}</span> : null}
                        </p>
                        <p className="text-muted-foreground text-sm">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                        {product.rating > 0 && <p className="text-muted-foreground text-sm">Rating: {product.rating.toFixed(1)}/5</p>}
                        {product.tags && product.tags.length > 0 && <p className="text-muted-foreground text-sm">Tags: {product.tags.join(', ')}</p>}
                        <p className="text-foreground">{product.description || 'No description available.'}</p>
                        <div className="flex gap-4">
                            <Button
                                onClick={handleAddToCart}
                                className="bg-primary text-primary-foreground hover:bg-primary-dark w-full"
                                disabled={product.stock === 0}
                            >
                                Add to Cart
                            </Button>
                            {auth.user && auth.user.id === product.user_id && (
                                <Button onClick={handleEdit} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full">
                                    Edit Product
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ProductShowPage;
