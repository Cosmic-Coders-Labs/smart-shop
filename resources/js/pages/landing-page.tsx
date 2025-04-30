import { LandingPageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

const LandingPage: React.FC = () => {
    const { featuredProducts, auth } = usePage<LandingPageProps>().props;
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    return (
        <div className="bg-background min-h-screen font-sans">
            <Head title="SmartShop - AI-Powered E-Commerce" />

            {/* Navigation */}
            <nav className="bg-primary text-primary-foreground p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="font-jersey text-2xl font-bold tracking-wide">SmartShop</h1>
                    <div className="space-x-4">
                        {auth ? (
                            <span>Welcome, {auth.name}</span>
                        ) : (
                            <>
                                <Link href="/login" className="hover:underline">
                                    Login
                                </Link>
                                <Link href="/register" className="hover:underline">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto text-center">
                    <h2 className="font-jersey mb-4 text-5xl font-bold tracking-wider">Welcome to SmartShop</h2>
                    <p className="mb-6 text-xl">Discover personalized shopping with AI-driven recommendations and real-time support.</p>
                    <Link
                        href={auth ? '/products' : '/register'}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md px-6 py-3 font-semibold"
                    >
                        {auth ? 'Browse Products' : 'Get Started'}
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-muted py-16">
                <div className="container mx-auto">
                    <h3 className="text-foreground mb-8 text-center text-3xl font-bold">Featured Products</h3>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="bg-card text-card-foreground overflow-hidden rounded-lg shadow-md">
                                <img
                                    src={product.image_url || 'https://via.placeholder.com/300'}
                                    alt={product.name}
                                    className="h-48 w-full object-cover"
                                />
                                <div className="p-4">
                                    <h4 className="text-xl font-semibold">{product.name}</h4>
                                    <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                                    <p className="text-muted-foreground text-sm">{product.category}</p>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-block rounded-md px-4 py-2"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Features */}
            <section className="bg-background py-16">
                <div className="container mx-auto">
                    <h3 className="text-foreground mb-8 text-center text-3xl font-bold">Why Choose SmartShop?</h3>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
                            <h4 className="mb-2 text-xl font-semibold">Personalized Recommendations</h4>
                            <p className="text-muted-foreground">Our AI analyzes your preferences to suggest products you'll love.</p>
                        </div>
                        <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
                            <h4 className="mb-2 text-xl font-semibold">Virtual Assistant</h4>
                            <p className="text-muted-foreground">Get instant help with our AI-powered chatbot, available 24/7.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chatbot UI */}
            <div className="fixed right-4 bottom-4">
                <button
                    onClick={toggleChat}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-4 shadow-lg"
                    aria-label="Toggle chat"
                >
                    💬
                </button>
                {isChatOpen && (
                    <div className="bg-card text-card-foreground mt-2 flex h-96 w-80 flex-col rounded-lg p-4 shadow-xl">
                        <div className="flex-1 overflow-y-auto">
                            <p className="text-muted-foreground">Bot: Hi! How can I assist you today?</p>
                            {/* Placeholder for chat messages */}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Chat functionality coming soon!');
                            }}
                            className="mt-2 flex"
                        >
                            <input
                                type="text"
                                placeholder="Type your message..."
                                className="border-input bg-background text-foreground flex-1 rounded-l-md border p-2"
                            />
                            <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-r-md p-2">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto text-center">
                    <p>© 2025 SmartShop Inc. All rights reserved.</p>
                    <div className="mt-4 space-x-4">
                        <Link href="/about" className="hover:underline">
                            About
                        </Link>
                        <Link href="/contact" className="hover:underline">
                            Contact
                        </Link>
                        <Link href="/privacy" className="hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
