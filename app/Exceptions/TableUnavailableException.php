<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception dilempar ketika meja yang dipilih tidak tersedia (bentrok jadwal atau dinonaktifkan).
 * (Unit 4: OOP Exception Handling)
 */
class TableUnavailableException extends Exception
{
    public function __construct(string $message = 'Meja tidak tersedia pada jadwal yang dipilih.')
    {
        parent::__construct($message);
    }
}
