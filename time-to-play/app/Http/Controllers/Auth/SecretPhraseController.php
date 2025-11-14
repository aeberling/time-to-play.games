<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SecretPhraseController extends Controller
{
    /**
     * Update the user's secret phrase.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'secret_phrase' => ['nullable', 'string', 'min:8'],
        ]);

        $user = $request->user();

        if ($validated['secret_phrase']) {
            // Check if any other user already has this secret phrase
            $users = User::whereNotNull('secret_phrase')
                ->where('id', '!=', $user->id)
                ->get();

            foreach ($users as $otherUser) {
                if (Hash::check($validated['secret_phrase'], $otherUser->secret_phrase)) {
                    throw ValidationException::withMessages([
                        'secret_phrase' => 'This secret phrase is already in use by another user. Please choose a different phrase.',
                    ]);
                }
            }

            $user->update([
                'secret_phrase' => Hash::make($validated['secret_phrase']),
            ]);
        } else {
            // If empty, remove the secret phrase
            $user->update([
                'secret_phrase' => null,
            ]);
        }

        return back()->with('status', 'secret-phrase-updated');
    }
}
