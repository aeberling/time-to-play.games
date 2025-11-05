<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/**
 * UserController
 *
 * Handles user-related API endpoints
 */
class UserController extends Controller
{
    /**
     * Get list of online users
     *
     * GET /api/users/online
     */
    public function online(): JsonResponse
    {
        // Get all users who have a last_seen timestamp within the last 5 minutes
        $onlineUserIds = [];
        $now = now();

        // Get all user IDs from cache (we store individual timestamps per user)
        $allUserIds = User::pluck('id');

        foreach ($allUserIds as $userId) {
            $lastSeen = Cache::get("user:{$userId}:last_seen");
            if ($lastSeen && $lastSeen->diffInMinutes($now) < 5) {
                $onlineUserIds[] = $userId;
            }
        }

        if (empty($onlineUserIds)) {
            return response()->json([
                'users' => [],
                'count' => 0,
            ]);
        }

        $users = User::whereIn('id', $onlineUserIds)
            ->select('id', 'name', 'email', 'display_name', 'avatar_url', 'created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'display_name' => $user->display_name,
                    'avatar_url' => $user->avatar_url,
                    'initials' => $this->getInitials($user),
                ];
            });

        return response()->json([
            'users' => $users,
            'count' => $users->count(),
        ]);
    }

    /**
     * Mark current user as online (heartbeat)
     *
     * POST /api/users/heartbeat
     */
    public function heartbeat(): JsonResponse
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Update individual user's last seen timestamp with 5-minute expiry
        Cache::put("user:{$userId}:last_seen", now(), now()->addMinutes(5));

        \Log::info("Heartbeat received for user {$userId}");

        return response()->json([
            'message' => 'Heartbeat received',
            'timestamp' => now()->toISOString(),
            'user_id' => $userId,
        ]);
    }

    /**
     * Get user initials for avatar
     */
    private function getInitials(User $user): string
    {
        $name = $user->display_name ?? $user->name;
        $parts = explode(' ', $name);

        if (count($parts) >= 2) {
            return strtoupper(substr($parts[0], 0, 1) . substr($parts[1], 0, 1));
        }

        return strtoupper(substr($name, 0, 2));
    }
}
