<?php

return [
    /*
    |--------------------------------------------------------------------------
    | War in Heaven Game Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for the War in Heaven game
    |
    */

    // Board settings
    'board' => [
        'size' => 11, // 11x11 hex grid (can be 7, 9, 11, 13, etc.)
        'default_layout' => 'standard_11x11',
    ],

    // Game flow settings
    'game_flow' => [
        'starting_hand_size' => 5,
        'cards_drawn_per_turn' => 1,
        'max_hand_size' => 10,
    ],

    // Victory conditions
    'victory' => [
        'victory_points_to_win' => 10,
        'enable_elimination_victory' => true,
        'enable_objective_victory' => false, // TODO: Implement objectives
    ],

    // Resources
    'resources' => [
        'starting_special_resource' => 3,
        'special_resource_per_turn' => 1,
    ],

    // Turn timer settings
    'timers' => [
        'turn_time_limit' => 300, // 5 minutes per turn (in seconds)
        'enable_turn_timer' => true,
    ],

    // Piece settings
    'pieces' => [
        'max_pieces_per_faction' => 20,
    ],

    // Faction-specific settings
    'factions' => [
        'FACTION1' => [
            'display_name' => 'Faction 1', // TODO: Replace with actual name
            'color' => '#4A90E2',
            'starting_pieces' => [
                // TODO: Define starting piece types and positions
            ],
        ],
        'FACTION2' => [
            'display_name' => 'Faction 2', // TODO: Replace with actual name
            'color' => '#E24A4A',
            'starting_pieces' => [
                // TODO: Define starting piece types and positions
            ],
        ],
    ],

    // Feature flags
    'features' => [
        'enable_fog_of_war' => false,
        'enable_terrain_effects' => true,
        'enable_card_drafting' => false,
    ],
];
