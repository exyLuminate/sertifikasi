<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Dibuat = 'dibuat';
    case Selesai = 'selesai';
    case Dibatalkan = 'dibatalkan';

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Dibuat => [self::Selesai, self::Dibatalkan],
            self::Selesai, self::Dibatalkan => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }
}
