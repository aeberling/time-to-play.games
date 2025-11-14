<?php

namespace App\Games\ValueObjects;

/**
 * Value object representing the result of move validation
 */
class ValidationResult
{
    private function __construct(
        private bool $valid,
        private ?string $error = null
    ) {}

    /**
     * Create a valid result
     */
    public static function valid(): self
    {
        return new self(true);
    }

    /**
     * Create an invalid result with error message
     */
    public static function invalid(string $error): self
    {
        return new self(false, $error);
    }

    /**
     * Check if the move is valid
     */
    public function isValid(): bool
    {
        return $this->valid;
    }

    /**
     * Get the error message (null if valid)
     */
    public function getError(): ?string
    {
        return $this->error;
    }
}
