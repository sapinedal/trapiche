<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboard,
    ) {
    }

    public function stats(Request $request)
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        return response()->json([
            'data' => $this->dashboard->stats(
                $request->user(),
                $request->query('date_from'),
                $request->query('date_to'),
            ),
            'message' => null,
            'status' => 'success',
        ]);
    }
}
