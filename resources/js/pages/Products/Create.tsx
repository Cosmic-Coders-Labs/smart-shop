import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category_id: number;
    tags: string[];
    discount: number | null;
    images: { id: number; image_path: string; is_primary: boolean }[];
    primary_image_index: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Products', href: route('products.index') },
    { title: 'Create Product', href: route('products.create') },
];

const ProductCreatePage: React.FC = () => {
    const { categories, product, flash, errors } = usePage<{
        categories: Array<{ id: number; name: string }>;
        product: Product | null;
        flash: { success?: string; error?: string };
        errors: Record<string, string>;
    }>().props;

    const isEditing = !!product;

    const [form, setForm] = useState({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price.toString() ?? '',
        stock: product?.stock.toString() ?? '',
        category_id: product?.category_id.toString() ?? '',
        tags: product?.tags ?? [],
        discount: product?.discount?.toString() ?? '',
        images: [] as File[],
        existing_images: product?.images ?? [],
        primary_image_index: product?.images.findIndex((img) => img.is_primary) ?? 0,
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        console.log('ProductCreatePage Flash:', flash);
        console.log('ProductCreatePage Errors:', errors);
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => toast.error(error));
        }
        // toast.success('Test toast on ProductCreatePage'); // Uncomment to test
    }, [flash, errors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setForm((prev) => ({ ...prev, category_id: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setForm((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
        }
    };

    const handlePrimaryImageChange = (index: number, isNewImage: boolean) => {
        setForm((prev) => ({ ...prev, primary_image_index: index }));
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            setForm((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        setForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('stock', form.stock);
        formData.append('category_id', form.category_id);
        formData.append('rating', '0'); // Default rating to 0
        formData.append('tags', JSON.stringify(form.tags));
        formData.append('discount', form.discount);
        form.images.forEach((image, index) => {
            formData.append('images[]', image);
        });
        form.existing_images.forEach((image, index) => {
            formData.append(`existing_images[${index}][id]`, image.id.toString());
            formData.append(`existing_images[${index}][is_primary]`, (index === form.primary_image_index).toString());
        });
        formData.append('primary_image_index', form.primary_image_index.toString());

        const method = isEditing ? 'put' : 'post';
        const routeName = isEditing ? route('products.update', product!.id) : route('products.store');

        router[method](routeName, formData, {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onError: (errors) => {
                console.log('Product errors:', errors);
            },
            onSuccess: () => {
                console.log(isEditing ? 'Product updated successfully' : 'Product created successfully');
                if (!isEditing) {
                    setForm({
                        name: '',
                        description: '',
                        price: '',
                        stock: '',
                        category_id: '',
                        tags: [],
                        discount: '',
                        images: [],
                        existing_images: [],
                        primary_image_index: 0,
                    });
                    setTagInput('');
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
            <Head title={`${isEditing ? 'Edit' : 'Create'} Product - SmartShop`} />
            <h1 className="text-primary mb-6 text-3xl font-bold">{isEditing ? 'Edit Product' : 'Create Product'}</h1>

            <form onSubmit={handleSubmit} className="bg-card w-full rounded-lg p-8 shadow-md">
                <div className="grid gap-6">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="name" className="text-left font-medium">
                            Name
                        </Label>
                        <div className="col-span-2">
                            <Input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder={isEditing ? form.name || 'Enter product name' : 'Enter product name'}
                                className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-start gap-4">
                        <Label htmlFor="description" className="text-left font-medium">
                            Description
                        </Label>
                        <div className="col-span-2">
                            <Textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder={isEditing ? form.description || 'Enter product description' : 'Enter product description'}
                                className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-left font-medium">Price & Stock</Label>
                        <div className="col-span-2 flex gap-4">
                            <div className="flex-1">
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder={isEditing ? form.price || 'Price' : 'Price'}
                                    className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                                    required
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                            </div>
                            <div className="flex-1">
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={form.stock}
                                    onChange={handleChange}
                                    placeholder={isEditing ? form.stock || 'Stock quantity' : 'Stock quantity'}
                                    className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                                    required
                                />
                                {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="category_id" className="text-left font-medium">
                            Category
                        </Label>
                        <div className="col-span-2">
                            <Select value={form.category_id} onValueChange={handleSelectChange}>
                                <SelectTrigger className="focus:border-primary focus:ring-primary w-full rounded border-gray-300">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="discount" className="text-left font-medium">
                            Discount
                        </Label>
                        <div className="col-span-2">
                            <Input
                                id="discount"
                                name="discount"
                                type="number"
                                min="0"
                                max="100"
                                value={form.discount}
                                onChange={handleChange}
                                placeholder={isEditing ? form.discount || 'Discount (%)' : 'Discount (%)'}
                                className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                            />
                            {errors.discount && <p className="mt-1 text-sm text-red-500">{errors.discount}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-start gap-4">
                        <Label htmlFor="tags" className="text-left font-medium">
                            Tags
                        </Label>
                        <div className="col-span-2">
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={handleTagInputChange}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Type tag and press Enter"
                                className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                            />
                            {form.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {form.tags.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="bg-primary text-primary-foreground flex items-center rounded-full px-3 py-1 text-sm"
                                        >
                                            {tag}
                                            <button type="button" onClick={() => removeTag(index)} className="ml-2 text-sm hover:text-red-200">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.tags && <p className="mt-1 text-sm text-red-500">{errors.tags}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-start gap-4">
                        <Label htmlFor="images" className="text-left font-medium">
                            Images
                        </Label>
                        <div className="col-span-2">
                            <Input
                                id="images"
                                name="images"
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                onChange={handleFileChange}
                                className="focus:border-primary focus:ring-primary w-full rounded border-gray-300"
                            />
                            {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                            {errors['images.0'] && <p className="mt-1 text-sm text-red-500">{errors['images.0']}</p>}
                        </div>
                    </div>

                    {(form.images.length > 0 || form.existing_images.length > 0) && (
                        <div className="grid grid-cols-3 items-start gap-4">
                            <Label className="text-left font-medium">Primary Image</Label>
                            <div className="col-span-2">
                                <div className="grid grid-cols-3 gap-4">
                                    {form.existing_images.map((image, index) => (
                                        <div key={`existing-${image.id}`} className="relative">
                                            <img
                                                src={`/storage/${image.image_path}`}
                                                alt={`Existing ${index}`}
                                                className="h-24 w-full rounded object-cover"
                                            />
                                            <input
                                                type="radio"
                                                name="primary_image_index"
                                                checked={form.primary_image_index === index}
                                                onChange={() => handlePrimaryImageChange(index, false)}
                                                className="absolute top-2 right-2 h-4 w-4"
                                            />
                                        </div>
                                    ))}
                                    {form.images.map((image, index) => (
                                        <div key={`new-${index}`} className="relative">
                                            <img src={URL.createObjectURL(image)} alt={`New ${index}`} className="h-24 w-full rounded object-cover" />
                                            <input
                                                type="radio"
                                                name="primary_image_index"
                                                checked={form.primary_image_index === index + form.existing_images.length}
                                                onChange={() => handlePrimaryImageChange(index + form.existing_images.length, true)}
                                                className="absolute top-2 right-2 h-4 w-4"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {errors.primary_image_index && <p className="mt-1 text-sm text-red-500">{errors.primary_image_index}</p>}
                            </div>
                        </div>
                    )}
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 mt-8 w-full rounded py-2 text-white">
                    {isEditing ? 'Update Product' : 'Create Product'}
                </Button>
            </form>
        </AppLayout>
    );
};

export default ProductCreatePage;
