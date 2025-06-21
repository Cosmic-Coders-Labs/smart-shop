<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client as GuzzleClient;
use Inertia\Inertia;

class ChatbotController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $messages = $user
            ? ChatMessage::where('user_id', $user->id)
            ->orderBy('timestamp', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'user' => $message->is_from_bot ? null : $message->message,
                    'bot' => $message->is_from_bot ? $message->message : null,
                    'timestamp' => $message->timestamp,
                ];
            })
            ->toArray()
            : [];

        return Inertia::render('Support/Chat', [
            'initialMessages' => $messages,
            'flash' => session()->get('flash', []),
        ]);
    }

    public function sendMessage(Request $request)
    {
        Log::info('ChatbotController::sendMessage called', ['payload' => $request->all()]);

        try {
            // Validate input
            $validated = $request->validate([
                'message' => 'required|string|max:1000',
            ]);

            $userMessage = $validated['message'];
            $user = Auth::user();

            if (!$user) {
                Log::warning('Unauthenticated user attempted to send message');
                throw new \Exception('You must be logged in to send a message.');
            }

            // Store user message
            $chatMessage = ChatMessage::create([
                'user_id' => $user->id,
                'message' => $userMessage,
                'is_from_bot' => false,
                'timestamp' => now(),
            ]);

            // Gemini API configuration
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                Log::error('Gemini API key not configured');
                throw new \Exception('Gemini API key not configured.');
            }

            $client = new GuzzleClient();
            $maxAttempts = 3;
            $attempt = 0;
            $botResponse = null;

            // Structured prompt for chatbot response
            $prompt = <<<EOD
You are a helpful support chatbot for an e-commerce platform. Respond to the user's message in a professional, friendly, and concise manner. Provide accurate and relevant assistance based on the user's query: "{$userMessage}". The response should be 50-100 words and suitable for customer support. Return the response in JSON format with the structure:
{
  "response": "string"
}
EOD;

            while ($attempt < $maxAttempts && !$botResponse) {
                $attempt++;
                Log::info('Attempting chatbot response generation', ['attempt' => $attempt]);

                $response = $client->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', [
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'query' => ['key' => $apiKey],
                    'json' => [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt],
                                ],
                            ],
                        ],
                    ],
                ]);

                $responseData = json_decode($response->getBody(), true);
                $generatedText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';

                // Clean and parse JSON
                $generatedText = trim($generatedText, "```json\n```");
                $generatedResponse = json_decode($generatedText, true);

                if (!$generatedResponse || !isset($generatedResponse['response']) || empty(trim($generatedResponse['response']))) {
                    Log::warning('Invalid Gemini API response', ['response' => $generatedText, 'attempt' => $attempt]);
                    continue;
                }

                $botResponse = $generatedResponse['response'];
                Log::info('Chatbot response generated successfully', ['response' => $botResponse]);
            }

            if (!$botResponse) {
                Log::error('Failed to generate a valid response after max attempts', ['attempts' => $maxAttempts]);
                $botResponse = 'Sorry, I could not process your request. Please try again.';
            }

            // Store bot response
            $botMessage = ChatMessage::create([
                'user_id' => $user->id,
                'message' => $botResponse,
                'is_from_bot' => true,
                'timestamp' => now(),
            ]);

            // Fetch updated message history
            $messages = ChatMessage::where('user_id', $user->id)
                ->orderBy('timestamp', 'asc')
                ->get()
                ->map(function ($message) {
                    return [
                        'user' => $message->is_from_bot ? null : $message->message,
                        'bot' => $message->is_from_bot ? $message->message : null,
                        'timestamp' => $message->timestamp,
                    ];
                })
                ->toArray();

            return Inertia::render('Support/Chat', [
                'initialMessages' => $messages,
                'flash' => ['success' => 'Message sent successfully'],
            ]);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            Log::error('Gemini API client error', [
                'message' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response body',
            ]);
            return redirect()->back()->with('error', 'Failed to process message: API error');
        } catch (\Exception $e) {
            Log::error('Error in ChatbotController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Failed to process message: ' . $e->getMessage());
        }
    }
}
