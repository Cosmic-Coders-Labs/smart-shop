import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Define types for props and messages
interface Message {
    user: string | null;
    bot: string | null;
    timestamp: string;
}

interface Auth {
    user: { id: number; name: string } | null;
}

interface Flash {
    success?: string;
    error?: string;
}

interface ChatPageProps {
    initialMessages?: Message[];
    flash?: Flash;
    auth?: Auth;
}

interface BreadcrumbItem {
    title: string;
    href: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Support Chat',
        href: route('chat.index'),
    },
];

const ChatPage: React.FC<ChatPageProps> = ({ initialMessages = [], flash, auth }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle message submission
    const handleSendMessage = () => {
        if (!input.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!auth?.user) {
            toast.error('Please log in to send a message');
            return;
        }

        router.post(
            route('chat.send'),
            { message: input },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setMessages(page.props.initialMessages as Message[]);
                    setInput('');
                },
                onError: (errors: Record<string, string>) => {
                    toast.error(errors.message || 'Failed to send message');
                },
            },
        );
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <Head title="Support Chat - SmartShop" />
            <h1 className="text-primary mb-8 text-3xl font-bold">Support Chat</h1>

            <Card className="bg-card text-card-foreground flex flex-1 flex-col">
                <CardHeader>
                    <CardTitle>Chat with Support</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '70vh' }}>
                    {messages.length === 0 ? (
                        <p className="text-muted-foreground text-center">
                            {auth?.user ? 'Start a conversation with our support team!' : 'Please log in to start chatting.'}
                        </p>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-4">
                                {msg.user && (
                                    <div className="flex justify-end">
                                        <div className="bg-primary text-primary-foreground max-w-[70%] rounded-lg p-3">{msg.user}</div>
                                    </div>
                                )}
                                {msg.bot && (
                                    <div className="mt-2 flex justify-start">
                                        <div className="bg-muted text-muted-foreground max-w-[70%] rounded-lg p-3">{msg.bot}</div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="bg-input text-foreground"
                            disabled={!auth?.user}
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-primary text-primary-foreground hover:bg-primary-dark"
                            disabled={!auth?.user}
                        >
                            Send
                        </Button>
                    </div>
                    {!auth?.user && (
                        <p className="text-muted-foreground mt-2 text-sm">
                            Please{' '}
                            <a href={route('login')} className="text-primary hover:underline">
                                log in
                            </a>{' '}
                            to send messages.
                        </p>
                    )}
                </div>
            </Card>
        </AppLayout>
    );
};

export default ChatPage;
