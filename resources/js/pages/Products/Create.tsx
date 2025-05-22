import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
}

interface Image {
    id: number;
    image_path: string;
    is_primary: boolean;
    url: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    rating: number;
    tags: string[];
    discount: number;
    existing_images: Image[];
    primary_image_index: number;
}

interface PageProps {
    categories: Category[];
    product?: Product;
    generatedDescription?: string;
    flash?: { success?: string; error?: string };
}

const CreateProductPage: React.FC = () => {
    const { categories, product, generatedDescription, flash } = usePage<PageProps>().props;

    const { data, setData, errors, post, put, processing } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        stock: product?.stock?.toString() || '',
        category_id: product?.category_id?.toString() || '',
        rating: product?.rating?.toString() || '',
        tags: product?.tags || [],
        discount: product?.discount?.toString() || '',
        images: [] as File[],
        existing_images: product?.existing_images || [],
        primary_image_index: product?.primary_image_index || 0,
    });

    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Handle flash messages and generated description
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (generatedDescription) {
            setData('description', generatedDescription);
        }
    }, [flash, generatedDescription]);

    // Handle image uploads with preview and validation
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes

        const validFiles: File[] = [];
        const previews: string[] = [];

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Invalid file type for ${file.name}. Only JPEG, PNG, JPG, GIF allowed.`);
                return;
            }
            if (file.size > maxSize) {
                toast.error(`File ${file.name} exceeds 2MB limit.`);
                return;
            }
            validFiles.push(file);
            previews.push(URL.createObjectURL(file));
        });

        setData('images', validFiles);
        setImagePreviews(previews);

        // Clean up previews on unmount
        return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
    };

    // Generate description using web route
    const generateDescription = () => {
        if (!data.name) {
            toast.error('Please provide a product name.');
            return;
        }
        if (data.images.length === 0) {
            toast.error('Please upload at least one image.');
            return;
        }

        setIsGeneratingDescription(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('image', data.images[0]);

        router.post(route('products.generate-description'), formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Description generated successfully');
                setIsGeneratingDescription(false);
            },
            onError: (errors) => {
                console.error('Generate description error:', errors);
                const errorMessage = errors.image
                    ? `Image error: ${errors.image}`
                    : errors.name
                      ? `Name error: ${errors.name}`
                      : errors.error || 'Failed to generate description';
                toast.error(errorMessage);
                setIsGeneratingDescription(false);
            },
        });
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'images') {
                (value as File[]).forEach((image, index) => {
                    formData.append(`images[${index}]`, image);
                });
            } else if (key === 'tags' || key === 'existing_images') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value as string);
            }
        });

        if (product) {
            put(route('products.update', product.id), {
                data: formData,
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => toast.success('Product updated successfully'),
                onError: () => toast.error('Failed to update product'),
            });
        } else {
            post(route('products.store'), {
                data: formData,
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => toast.success('Product created successfully'),
                onError: () => toast.error('Failed to create product'),
            });
        }
    };

    // Handle tag input
    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            setData('tags', [...data.tags, e.currentTarget.value.trim()]);
            e.currentTarget.value = '';
        }
    };

    // Remove tag
    const removeTag = (index: number) => {
        setData(
            'tags',
            data.tags.filter((_, i) => i !== index),
        );
    };

    // Handle existing image removal
    const removeExistingImage = (index: number) => {
        setData(
            'existing_images',
            data.existing_images.filter((_, i) => i !== index),
        );
    };

    // Set primary image
    const setPrimaryImage = (index: number) => {
        setData('primary_image_index', index);
        const updatedImages = data.existing_images.map((img, i) => ({
            ...img,
            is_primary: i === index,
        }));
        setData('existing_images', updatedImages);
    };

    // Remove uploaded image
    const removeUploadedImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
        URL.revokeObjectURL(imagePreviews[index]);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Products', href: route('products.index') },
                { title: product ? 'Edit Product' : 'Create Product', href: '#' },
            ]}
            className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4"
        >
            <Head title={product ? `Edit ${product.name}` : 'Create Product'} />
            <h1 className="text-primary mb-8 text-3xl font-bold">{product ? 'Edit Product' : 'Create Product'}</h1>

            <Card className="border-primary/10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">{product ? 'Edit Product' : 'Create New Product'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-lg font-semibold">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Product Name"
                                className="border-primary/20 focus:ring-primary"
                            />
                            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-lg font-semibold">
                                Price
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="Price"
                                className="border-primary/20 focus:ring-primary"
                            />
                            {errors.price && <p className="text-destructive text-sm">{errors.price}</p>}
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-lg font-semibold">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                                placeholder="Stock"
                                className="border-primary/20 focus:ring-primary"
                            />
                            {errors.stock && <p className="text-destructive text-sm">{errors.stock}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category_id" className="text-lg font-semibold">
                                Category
                            </Label>
                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                <SelectTrigger className="border-primary/20 focus:ring-primary">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-destructive text-sm">{errors.category_id}</p>}
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                            <Label htmlFor="rating" className="text-lg font-semibold">
                                Rating
                            </Label>
                            <Input
                                id="rating"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={data.rating}
                                onChange={(e) => setData('rating', e.target.value)}
                                placeholder="Rating (0-5)"
                                className="border-primary/20 focus:ring-primary"
                            />
                            {errors.rating && <p className="text-destructive text-sm">{errors.rating}</p>}
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                            <Label htmlFor="discount" className="text-lg font-semibold">
                                Discount (%)
                            </Label>
                            <Input
                                id="discount"
                                type="number"
                                min="0"
                                max="100"
                                value={data.discount}
                                onChange={(e) => setData('discount', e.target.value)}
                                placeholder="Discount"
                                className="border-primary/20 focus:ring-primary"
                            />
                            {errors.discount && <p className="text-destructive text-sm">{errors.discount}</p>}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="tags" className="text-lg font-semibold">
                                Tags
                            </Label>
                            <Input
                                id="tags"
                                onKeyDown={handleTagInput}
                                placeholder="Press Enter to add tags"
                                className="border-primary/20 focus:ring-primary"
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data.tags.map((tag, index) => (
                                    <span key={index} className="bg-primary text-primary-foreground flex items-center rounded-full px-3 py-1 text-sm">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="text-primary-foreground ml-2 hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {errors.tags && <p className="text-destructive text-sm">{errors.tags}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description" className="text-lg font-semibold">
                                    Description
                                </Label>
                                <Button
                                    type="button"
                                    onClick={generateDescription}
                                    disabled={isGeneratingDescription || !data.name || data.images.length === 0}
                                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                >
                                    {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
                                </Button>
                            </div>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Product Description"
                                className="border-primary/20 focus:ring-primary min-h-[100px]"
                            />
                            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                        </div>

                        {/* Existing Images */}
                        {data.existing_images.length > 0 && (
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-lg font-semibold">Existing Images</Label>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {data.existing_images.map((image, index) => (
                                        <div key={image.id} className="group relative">
                                            <img
                                                src={image.url}
                                                alt="Product Image"
                                                className={`h-32 w-full rounded-lg border-2 object-cover transition-all duration-200 ${
                                                    index === data.primary_image_index ? 'border-primary ring-primary/50 ring-2' : 'border-border'
                                                } hover:cursor-pointer hover:shadow-lg`}
                                                onClick={() => setPrimaryImage(index)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="bg-destructive absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                ×
                                            </button>
                                            {index === data.primary_image_index && (
                                                <span className="bg-primary absolute bottom-2 left-2 rounded px-2 py-1 text-xs text-white">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images with Preview */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="images" className="text-lg font-semibold">
                                Upload Images
                            </Label>
                            <Input
                                id="images"
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                onChange={handleImageChange}
                                className="border-primary/20 focus:ring-primary"
                            />
                            {errors.images && <p className="text-destructive text-sm">{errors.images}</p>}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="group relative">
                                            <img
                                                src={preview}
                                                alt={`Uploaded Image ${index + 1}`}
                                                className="border-border h-32 w-full rounded-lg border-2 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeUploadedImage(index)}
                                                className="bg-destructive absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full py-3 text-lg"
                            >
                                {product ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default CreateProductPage;
