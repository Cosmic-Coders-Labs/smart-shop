import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CartPageProps } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Cart',
        href: route('cart.index'),
    },
];

const CartPage = ({ cartItems, flash }: CartPageProps) => {
    // Handle flash messages
    useEffect(() => {
        console.log('CartPage Flash:', flash); // Debug: Log flash messages
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleUpdateQuantity = (cartId: number, quantity: number) => {
        if (quantity < 1) return;
        router.patch(
            route('cart.update', cartId),
            { quantity },
            {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => {
                    toast.error(errors.quantity || 'Failed to update cart');
                },
            },
        );
    };

    const handleRemoveItem = (cartId: number) => {
        router.delete(route('cart.destroy', cartId), {
            preserveState: true,
            preserveScroll: true,
            onError: (errors) => {
                toast.error(errors.error || 'Failed to remove item from cart');
            },
        });
    };

    const handleCheckout = () => {
        router.post(
            route('checkout.store'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Proceeding to checkout');
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to proceed to checkout');
                },
            },
        );
    };

    const calculateSubtotal = (item: (typeof cartItems)[0]) => {
        const price = item.product.discount ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
        return (price * item.quantity).toFixed(2);
    };

    const calculateTotal = () => {
        return cartItems
            .reduce((total, item) => {
                const price = item.product.discount ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
                return total + price * item.quantity;
            }, 0)
            .toFixed(2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className={'flex h-full flex-1 flex-col gap-4 rounded-xl p-4'}>
            <Head title="Shopping Cart - SmartShop" />
            <h1 className="text-primary mb-8 text-3xl font-bold">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <p className="text-muted-foreground text-center">Your cart is empty.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Cart Table */}
                    <div className="bg-card rounded-lg px-4 py-6 shadow-md lg:col-span-2">
                        <table className="w-full">
                            <thead>
                                <tr className="border-border border-b">
                                    <th className="text-foreground py-4 text-left">Product</th>
                                    <th className="text-foreground py-4 text-left">Price</th>
                                    <th className="text-foreground py-4 text-left">Quantity</th>
                                    <th className="text-foreground py-4 text-left">Subtotal</th>
                                    <th className="text-foreground py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id} className="border-border border-b">
                                        <td className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={
                                                        item.product.images.find((img) => img.is_primary)?.image_path
                                                            ? `/storage/${item.product.images.find((img) => img.is_primary).image_path}`
                                                            : item.product.images[0]?.image_path
                                                              ? `/storage/${item.product.images[0].image_path}`
                                                              : 'https://via.placeholder.com/100'
                                                    }
                                                    alt={item.product.name}
                                                    className="h-16 w-16 rounded object-cover"
                                                />
                                                <div>
                                                    <p className="text-foreground w-auto font-semibold overflow-ellipsis">{item.product.name}</p>
                                                    <p className="text-muted-foreground text-sm">{item.product.category.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            $
                                            {item.product.discount
                                                ? (item.product.price * (1 - item.product.discount / 100)).toFixed(2)
                                                : item.product.price.toFixed(2)}
                                        </td>
                                        <td className="py-4">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                                className="bg-input text-foreground w-16"
                                            />
                                        </td>
                                        <td className="py-4">${calculateSubtotal(item)}</td>
                                        <td className="py-4">
                                            <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cart Summary */}
                    <div className="bg-card rounded-lg px-4 py-6 shadow-md lg:col-span-1">
                        <h2 className="text-foreground mb-4 text-xl font-semibold">Order Summary</h2>
                        <div className="flex justify-between">
                            <span className="text-foreground">Total</span>
                            <span className="text-foreground font-bold">${calculateTotal()}</span>
                        </div>
                        <Button
                            onClick={handleCheckout}
                            className="bg-primary text-primary-foreground hover:bg-primary-dark mt-4 w-full"
                            disabled={cartItems.length === 0}
                        >
                            Proceed to Checkout
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default CartPage;
