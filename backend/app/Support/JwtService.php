<?php

namespace App\Support;

use App\Models\User;
use RuntimeException;

class JwtService
{
    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }

    private function rawSecret(): string
    {
        $configured = (string) config('jwt.secret', '');
        if ($configured !== '') {
            return $configured;
        }

        $appKey = (string) config('app.key', '');
        if ($appKey === '') {
            throw new RuntimeException('JWT secret is missing.');
        }

        if (str_starts_with($appKey, 'base64:')) {
            $decoded = base64_decode(substr($appKey, 7), true);
            if ($decoded === false || $decoded === '') {
                throw new RuntimeException('JWT secret is invalid.');
            }

            return $decoded;
        }

        return $appKey;
    }

    private function signature(string $headerPart, string $payloadPart): string
    {
        return $this->base64UrlEncode(
            hash_hmac(
                'sha256',
                $headerPart.'.'.$payloadPart,
                $this->rawSecret(),
                true
            )
        );
    }

    public function createToken(User $user): string
    {
        $issuedAt = time();
        $ttlMinutes = max((int) config('jwt.ttl_minutes', 120), 1);
        $expiresAt = $issuedAt + ($ttlMinutes * 60);

        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $payload = [
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'jti' => bin2hex(random_bytes(16)),
        ];

        $headerPart = $this->base64UrlEncode((string) json_encode($header));
        $payloadPart = $this->base64UrlEncode((string) json_encode($payload));
        $signaturePart = $this->signature($headerPart, $payloadPart);

        return $headerPart.'.'.$payloadPart.'.'.$signaturePart;
    }

    public function decodeToken(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid token format.');
        }

        [$headerPart, $payloadPart, $signaturePart] = $parts;

        $expectedSignature = $this->signature($headerPart, $payloadPart);
        if (! hash_equals($expectedSignature, $signaturePart)) {
            throw new RuntimeException('Invalid token signature.');
        }

        $headerJson = $this->base64UrlDecode($headerPart);
        $payloadJson = $this->base64UrlDecode($payloadPart);

        $header = json_decode($headerJson, true);
        $payload = json_decode($payloadJson, true);

        if (! is_array($header) || ! is_array($payload)) {
            throw new RuntimeException('Invalid token payload.');
        }

        if (($header['alg'] ?? null) !== 'HS256') {
            throw new RuntimeException('Unsupported token algorithm.');
        }

        $exp = $payload['exp'] ?? null;
        if (! is_int($exp) || $exp < time()) {
            throw new RuntimeException('Token expired.');
        }

        return $payload;
    }
}

