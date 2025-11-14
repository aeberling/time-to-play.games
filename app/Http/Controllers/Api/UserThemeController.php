<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserThemeController extends Controller
{
    /**
     * Get the current user's theme preference
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'theme_id' => $user->theme_id ?? 'ocean-breeze',
        ]);
    }

    /**
     * Update the current user's theme preference
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme_id' => 'required|string|in:ocean-breeze,forest-green,royal-purple,sunset-orange,midnight-dark,ruby-red',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid theme selection',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $user->theme_id = $request->theme_id;
        $user->save();

        return response()->json([
            'message' => 'Theme updated successfully',
            'theme_id' => $user->theme_id,
        ]);
    }
}
