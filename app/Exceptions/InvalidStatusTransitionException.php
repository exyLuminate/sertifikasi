<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception dilempar ketika transisi status reservasi melanggar alur status yang diizinkan.
 * (Unit 4: OOP Exception Handling)
 */
class InvalidStatusTransitionException extends Exception
{
    public function __construct(string $message = 'Transisi status reservasi tidak valid.')
    {
        parent::__construct($message);
    }
}
