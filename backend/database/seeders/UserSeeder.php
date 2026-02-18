<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\UserAvatar;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@bwa.local'],
            [
                'username' => 'admin',
                'name' => 'Admin',
                'surname' => 'BWA',
                'password' => 'admin1234',
                'role' => 'admin',
                'is_active' => true,
                'avatar' => UserAvatar::all()[0],
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@bwa.local'],
            [
                'username' => 'player1',
                'name' => 'Regular',
                'surname' => 'User',
                'password' => 'user1234',
                'role' => 'user',
                'is_active' => true,
                'avatar' => UserAvatar::all()[1],
            ]
        );
    }
}
