<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NoveltyType\StoreNoveltyTypeRequest;
use App\Http\Requests\NoveltyType\UpdateNoveltyTypeRequest;
use App\Http\Resources\NoveltyTypeResource;
use App\Models\NoveltyType;
use Illuminate\Http\Request;

class NoveltyTypeController extends Controller
{
    public function index(Request $request)
    {
        $types = NoveltyType::query()
            ->withCount('novelties')
            // El registro de novedades solo debe ofrecer tipos vigentes;
            // la parametrización necesita verlos todos.
            ->when(! $request->boolean('include_inactive'), fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => NoveltyTypeResource::collection($types),
            'message' => null,
            'status' => 'success',
        ]);
    }

    public function store(StoreNoveltyTypeRequest $request)
    {
        $type = NoveltyType::create($request->validated());

        return response()->json([
            'data' => new NoveltyTypeResource($type),
            'message' => 'Tipo de novedad creado correctamente.',
            'status' => 'success',
        ], 201);
    }

    public function show(NoveltyType $noveltyType)
    {
        return response()->json([
            'data' => new NoveltyTypeResource($noveltyType->loadCount('novelties')),
            'message' => null,
            'status' => 'success',
        ]);
    }

    public function update(UpdateNoveltyTypeRequest $request, NoveltyType $noveltyType)
    {
        $noveltyType->update($request->validated());

        return response()->json([
            'data' => new NoveltyTypeResource($noveltyType->loadCount('novelties')),
            'message' => 'Tipo de novedad actualizado correctamente.',
            'status' => 'success',
        ]);
    }

    /**
     * Un tipo con novedades asociadas no se elimina: se desactiva, para no
     * romper el histórico ni la trazabilidad de lo ya reportado.
     */
    public function destroy(Request $request, NoveltyType $noveltyType)
    {
        abort_unless($request->user()->isAdmin(), 403);

        if ($noveltyType->novelties()->exists()) {
            $noveltyType->update(['is_active' => false]);

            return response()->json([
                'data' => new NoveltyTypeResource($noveltyType),
                'message' => 'El tipo tiene novedades registradas, por lo que fue desactivado en lugar de eliminarse.',
                'status' => 'success',
            ]);
        }

        $noveltyType->delete();

        return response()->json([
            'data' => null,
            'message' => 'Tipo de novedad eliminado correctamente.',
            'status' => 'success',
        ]);
    }
}
