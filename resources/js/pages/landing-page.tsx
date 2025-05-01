import { LandingPageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

const LandingPage: React.FC = () => {
    const { featuredProducts, auth, chatMessages } = usePage<LandingPageProps>().props;
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    return (
        <div className="bg-background min-h-screen font-sans">
            <Head title="SmartShop - AI-Powered E-Commerce" />

            {/* Navigation */}
            <nav className="bg-primary text-primary-foreground p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="transform text-2xl font-bold tracking-wide transition-transform duration-300 hover:scale-105">SmartShop ✨</h1>
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
                    <h2 className="mb-4 text-3xl font-extrabold tracking-wider drop-shadow-lg">Welcome to SmartShop 🛍️</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
                        Shop smarter with AI-powered recommendations and a friendly virtual assistant!
                    </p>
                    <Link
                        href={auth ? '/products' : '/register'}
                        className="transform rounded-full bg-yellow-400 px-8 py-3 font-semibold text-gray-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-lg"
                    >
                        {auth ? 'Explore Products' : 'Start Shopping'}
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-muted py-16">
                <div className="container mx-auto">
                    <h3 className="animate-fade-in mb-10 text-center text-3xl font-bold text-gray-800">Featured Products 🌟</h3>
                    <div className="grid grid-cols-1 gap-8 px-2 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="bg-card text-card-foreground overflow-hidden rounded-lg shadow-md">
                                <img
                                    src={product.image_url || 'https://via.placeholder.com/300'}
                                    alt={product.name}
                                    className="h-48 w-full object-cover"
                                />
                                <div className="p-4">
                                    <h4 className="text-xl font-semibold">{product.name}</h4>
                                    <p className="text-muted-foreground">${Number(product.price).toFixed(2)}</p>
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
            <section className="bg-white py-16">
                <div className="container mx-auto">
                    <h3 className="animate-fade-in mb-10 text-center text-3xl font-bold text-gray-800">Why Shop with Us? 💡</h3>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="animate-slide-up transform rounded-2xl border border-white/20 bg-white/30 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105">
                            <h4 className="mb-2 text-xl font-semibold text-gray-800">Personalized Picks</h4>
                            <p className="text-gray-600">Our AI curates products just for you, making shopping a breeze!</p>
                        </div>
                        <div className="animate-slide-up transform rounded-2xl border border-white/20 bg-white/30 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105">
                            <h4 className="mb-2 text-xl font-semibold text-gray-800">Friendly Chatbot</h4>
                            <p className="text-gray-600">Get instant help from our 24/7 AI assistant, always ready to assist!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chatbot UI */}
            <div className="fixed right-6 bottom-6 z-50">
                <button
                    onClick={toggleChat}
                    className="transform rounded-full bg-pink-500 p-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 hover:bg-pink-600"
                    aria-label="Toggle chat"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                </button>
                {isChatOpen && (
                    <div className="mt-2 flex h-96 w-80 origin-bottom scale-100 transform flex-col rounded-2xl bg-white/80 opacity-100 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-in-out">
                        <div className="flex items-center justify-between rounded-t-2xl bg-purple-500 p-4 text-white">
                            <h4 className="font-semibold">Chat with SmartShop Bot</h4>
                            <button onClick={toggleChat} className="text-white hover:text-pink-200">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            {chatMessages && chatMessages.length > 0 ? (
                                chatMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`max-w-[80%] rounded-xl p-3 ${
                                            message.is_bot ? 'ml-auto bg-pink-100 text-gray-800' : 'mr-auto bg-purple-100 text-gray-800'
                                        }`}
                                    >
                                        <p className="text-sm font-medium">{message.is_bot ? 'SmartShop Bot' : message.user.name}</p>
                                        <p className="text-sm">{message.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Hi! How can I assist you today?</p>
                            )}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Chat functionality coming soon!');
                            }}
                            className="border-t border-gray-200 p-4"
                        >
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full bg-gray-100 p-2 text-gray-800 transition-all duration-300 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="rounded-full bg-purple-500 p-2 text-white transition-colors duration-300 hover:bg-purple-600"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div> )}
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-purple-600 to-pink-500 py-8 text-white">
                <div className="container mx-auto text-center">
                    <p className="text-sm opacity-80">© 2025 SmartShop Inc. All rights reserved.</p>
                    <div className="mt-4 space-x-6">
                        <Link href="/about" className="transition-colors duration-300 hover:text-pink-200">
                            About
                        </Link>
                        <Link href="/contact" className="transition-colors duration-300 hover:text-pink-200">
                            Contact
                        </Link>
                        <Link href="/privacy" className="transition-colors duration-300 hover:text-pink-200">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
