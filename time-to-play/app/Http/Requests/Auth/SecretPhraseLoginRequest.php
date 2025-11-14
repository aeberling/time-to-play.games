<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SecretPhraseLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'secret_phrase' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate using the secret phrase.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Find all users who have a secret phrase set
        $users = User::whereNotNull('secret_phrase')->get();

        $authenticated = false;
        foreach ($users as $user) {
            if (Hash::check($this->input('secret_phrase'), $user->secret_phrase)) {
                Auth::login($user, $this->boolean('remember'));
                $authenticated = true;
                break;
            }
        }

        if (!$authenticated) {
            // Hit rate limiter with decay of 30 seconds per attempt
            RateLimiter::hit($this->throttleKey(), 30);

            throw ValidationException::withMessages([
                'secret_phrase' => 'The secret phrase is incorrect. Please wait 30 seconds before trying again.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        // Allow only 1 attempt per 30 seconds
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 1)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'secret_phrase' => "You must wait {$seconds} seconds before trying again.",
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate('secret_phrase|'.$this->ip());
    }
}
