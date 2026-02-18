<?php

namespace App\Support;

class UserAvatar
{
    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [
            '/avatars/avatar-01.jpg',
            '/avatars/avatar-02.jpg',
            '/avatars/avatar-03.jpg',
            '/avatars/avatar-04.jpg',
            '/avatars/avatar-05.jpg',
            '/avatars/avatar-06.jpg',
            '/avatars/avatar-07.jpg',
            '/avatars/avatar-08.jpg',
            '/avatars/avatar-09.jpg',
            '/avatars/avatar-10.jpg',
        ];
    }

    public static function random(): string
    {
        $avatars = self::all();
        return $avatars[random_int(0, count($avatars) - 1)];
    }
}
