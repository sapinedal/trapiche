<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CostCenterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\NoveltyController;
use App\Http\Controllers\Api\NoveltyTypeController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/cost-centers', [CostCenterController::class, 'index']);

    Route::apiResource('employees', EmployeeController::class);

    // Las rutas específicas van antes del parámetro {novelty} para que
    // "mine", "summary" y "export" no se interpreten como un id.
    Route::get('/novelties/mine', [NoveltyController::class, 'mine']);
    Route::get('/novelties/summary', [NoveltyController::class, 'summary']);
    Route::get('/novelties/export', [NoveltyController::class, 'export']);
    Route::get('/novelties', [NoveltyController::class, 'index']);
    Route::post('/novelties', [NoveltyController::class, 'store']);
    Route::get('/novelties/{novelty}', [NoveltyController::class, 'show']);
    Route::patch('/novelties/{novelty}', [NoveltyController::class, 'update']);

    Route::get('/novelty-types', [NoveltyTypeController::class, 'index']);
    Route::get('/novelty-types/{noveltyType}', [NoveltyTypeController::class, 'show']);

    // Parametrización: exclusiva de Gestión Humana.
    Route::middleware('role:admin')->group(function () {
        Route::post('/novelty-types', [NoveltyTypeController::class, 'store']);
        Route::put('/novelty-types/{noveltyType}', [NoveltyTypeController::class, 'update']);
        Route::delete('/novelty-types/{noveltyType}', [NoveltyTypeController::class, 'destroy']);
    });
});
