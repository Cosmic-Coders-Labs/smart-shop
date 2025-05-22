<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use GuzzleHttp\Client as GuzzleClient;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GeminiApiController extends Controller
{
    public function generateDescription(Request $request)
    {
        Log::info('GeminiApiController::generateDescription called', ['payload' => $request->all()]);
        try {
            // Validate input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $name = $validated['name'];
            $image = $request->file('image');

            // Verify image integrity
            if (!$image->isValid()) {
                Log::warning('Invalid image file uploaded', ['filename' => $image->getClientOriginalName()]);
                throw new \Exception('Invalid image file uploaded.');
            }

            // Store the image temporarily
            $path = $image->store('temp', 'public');
            $imagePath = Storage::disk('public')->path($path);

            // Verify file exists
            if (!file_exists($imagePath)) {
                Log::error('Failed to store image file', ['path' => $imagePath]);
                throw new \Exception('Failed to store image file.');
            }

            $imageData = base64_encode(file_get_contents($imagePath));
            $mimeType = $image->getMimeType();

            // Gemini API configuration
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                Log::error('Gemini API key not configured');
                throw new \Exception('Gemini API key not configured.');
            }

            $client = new GuzzleClient();
            $maxAttempts = 3;
            $attempt = 0;
            $description = null;

            // Structured prompt for description
            $prompt = <<<EOD
Generate a detailed product description (100-200 words) for a product named '{$name}' based on the provided image. The description should be engaging, highlight key features visible in the image, and be suitable for an e-commerce platform. Ensure the description is unique and does not include placeholder text. Return the response in JSON format with the structure:
{
  "description": "string"
}
EOD;

            while ($attempt < $maxAttempts && !$description) {
                $attempt++;
                Log::info('Attempting description generation', ['attempt' => $attempt]);

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
                                    [
                                        'inlineData' => [
                                            'mimeType' => $mimeType,
                                            'data' => $imageData,
                                        ],
                                    ],
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

                if (!$generatedResponse || !isset($generatedResponse['description']) || empty(trim($generatedResponse['description']))) {
                    Log::warning('Invalid Gemini API response', ['response' => $generatedText, 'attempt' => $attempt]);
                    continue;
                }

                $description = $generatedResponse['description'];
                Log::info('Description generated successfully', ['description' => $description]);
            }

            // Delete temporary image
            Storage::disk('public')->delete($path);

            if (!$description) {
                Log::error('Failed to generate a valid description after max attempts', ['attempts' => $maxAttempts]);
                return redirect()->back()->with('error', 'Failed to generate a valid description after multiple attempts.');
            }

            // Return Inertia response with the generated description
            return Inertia::render('Products/Create', [
                'categories' => $request->session()->get('categories', []),
                'product' => $request->session()->get('product'),
                'generatedDescription' => $description,
                'flash' => ['success' => 'Description generated successfully'],
            ]);
        } catch (ValidationException $e) {
            Log::warning('Validation failed in GeminiApiController', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->with('error', 'Validation failed: ' . implode(', ', array_merge(...array_values($e->errors()))));
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            Log::error('Gemini API client error', [
                'message' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response body',
            ]);
            return redirect()->back()->with('error', 'Failed to generate description: API error');
        } catch (\Exception $e) {
            Log::error('Error in GeminiApiController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Failed to generate description: ' . $e->getMessage());
        }
    }
}
