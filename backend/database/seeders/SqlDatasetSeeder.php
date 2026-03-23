<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SqlDatasetSeeder extends Seeder
{
    public function run(): void
    {
        $sqlPath = database_path('seeders/sql/dojo_seed.sql');

        if (!is_file($sqlPath)) {
            return;
        }

        if (DB::table('users')->exists() || DB::table('products')->exists() || DB::table('orders')->exists()) {
            return;
        }

        $sql = file_get_contents($sqlPath);

        if ($sql === false || trim($sql) === '') {
            return;
        }

        // Normalize encoding/newlines for cross-platform dumps (Windows -> Linux).
        if (str_starts_with($sql, "\xEF\xBB\xBF")) {
            $sql = substr($sql, 3);
        }

        if (!mb_check_encoding($sql, 'UTF-8')) {
            $converted = @mb_convert_encoding($sql, 'UTF-8', 'UTF-16LE,UTF-16BE,UTF-8');
            if (is_string($converted) && $converted !== '') {
                $sql = $converted;
            }
        }

        $sql = str_replace("\0", '', $sql);
        $sql = str_replace(["\r\n", "\r"], "\n", $sql);

        $lines = preg_split('/\n/', $sql) ?: [];
        $statements = [];

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '--') || str_starts_with($line, '\\')) {
                continue;
            }

            if (preg_match('/^(INSERT\s+INTO\s+public\.|SELECT\s+pg_catalog\.setval\()/i', $line)) {
                $statements[] = $line;
            }
        }

        if ($statements === []) {
            return;
        }

        DB::transaction(function () use ($statements): void {
            foreach ($statements as $statement) {
                DB::unprepared($statement);
            }
        });
    }
}