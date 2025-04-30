<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatMessageController extends Controller
{
    public function index()
    {
        return ChatMessage::with('user')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $chatMessage = ChatMessage::create([
            'user_id' => Auth::id(),
            'message' => $request->message,
            'is_from_bot' => false,
            'timestamp' => now(),
        ]);

        // Placeholder for AI chatbot response
        $botResponse = $this->generateBotResponse($request->message);
        if ($botResponse) {
            $botMessage = ChatMessage::create([
                'user_id' => Auth::id(),
                'message' => $botResponse,
                'is_from_bot' => true,
                'timestamp' => now(),
            ]);
            return response()->json([
                'message' => 'Message sent and bot responded',
                'user_message' => $chatMessage,
                'bot_message' => $botMessage,
            ], 201);
        }

        return response()->json(['message' => 'Message sent', 'chat_message' => $chatMessage], 201);
    }

    public function show(ChatMessage $chatMessage)
    {
        return $chatMessage->load('user');
    }

    public function getUserChatHistory()
    {
        $user = Auth::user();
        $messages = ChatMessage::where('user_id', $user->id)
            ->orderBy('timestamp', 'asc')
            ->get();

        return response()->json(['chat_history' => $messages]);
    }

    protected function generateBotResponse($userMessage)
    {
        // Placeholder for AI chatbot logic (e.g., integrate with NLP service)
        // Example: Call an external AI service or use a simple rule-based response
        return "Thank you for your message: '$userMessage'. How can I assist you further?";
    }
}
