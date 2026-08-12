<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CostCenter;

class CostCenterController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => CostCenter::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'message' => null,
            'status' => 'success',
        ]);
    }
}
