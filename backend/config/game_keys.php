<?php

return [
    /*Used keys are purged after this number of days.*/
    'retention_days' => (int) env('GAME_KEY_RETENTION_DAYS', 30),
];
