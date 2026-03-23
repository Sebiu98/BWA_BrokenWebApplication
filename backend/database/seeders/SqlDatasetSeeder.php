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

        // Avoid duplicates when AUTO_SEED runs on every container start.
        if (DB::table('users')->exists() || DB::table('products')->exists() || DB::table('orders')->exists()) {
            return;
        }

        $sql = file_get_contents($sqlPath);

        if ($sql === false || trim($sql) === '') {
            return;
        }

        $lines = preg_split('/\R/', $sql) ?: [];
        $filtered = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($trimmed === '' || str_starts_with($trimmed, '--')) {
                continue;
            }

            // Skip psql client meta-commands.
            if (str_starts_with($trimmed, '\\')) {
                continue;
            }

            // Skip session-level statements that are not needed for app seeding.
            if (preg_match('/^(SET|SELECT\s+pg_catalog\.set_config|SET\s+SESSION\s+AUTHORIZATION)\b/i', $trimmed)) {
                continue;
            }

            // Trigger toggling requires elevated privileges and is not needed with ordered inserts.
            if (preg_match('/^ALTER\s+TABLE\s+.+\s+(DISABLE|ENABLE)\s+TRIGGER\s+ALL\s*;?$/i', $trimmed)) {
                continue;
            }

            $filtered[] = $line;
        }

        $cleanSql = implode("\n", $filtered);

        if (trim($cleanSql) === '') {
            return;
        }

        $statements = preg_split('/;\s*(?:\r?\n|$)/', $cleanSql) ?: [];

        DB::transaction(function () use ($statements): void {
            foreach ($statements as $statement) {
                $statement = trim($statement);

                if ($statement === '') {
                    continue;
                }

                DB::unprepared($statement.';');
            }
        });
    }
}