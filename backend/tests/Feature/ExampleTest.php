<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/up');

        $response->assertStatus(200);
    }

    public function test_health_endpoint_returns_expected_payload(): void
    {
        $response = $this->getJson('/api/health');

        $response
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonStructure([
                'status',
                'service',
                'env',
                'time',
            ]);
    }
}
