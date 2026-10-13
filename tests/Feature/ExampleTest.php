<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_root_redirects_to_login(): void
    {
        // Route '/' diarahkan ke login karena sistem ini internal (tidak ada halaman publik)
        $response = $this->get('/');

        $response->assertRedirect(route('login'));
    }
}
