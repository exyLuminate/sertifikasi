<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case Dipesan = 'dipesan';
    case Dikonfirmasi = 'dikonfirmasi';
    case Selesai = 'selesai';
    case Dibatalkan = 'dibatalkan';

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Dipesan => [self::Dikonfirmasi, self::Dibatalkan],
            self::Dikonfirmasi => [self::Selesai, self::Dibatalkan],
            self::Selesai, self::Dibatalkan => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }
}
