<?php

namespace App\Http\Controllers\Api;

use App\Exports\NoveltiesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Novelty\StoreNoveltyRequest;
use App\Http\Requests\Novelty\UpdateNoveltyStatusRequest;
use App\Http\Resources\NoveltyResource;
use App\Models\Novelty;
use App\Repositories\Contracts\NoveltyRepositoryInterface;
use App\Services\NoveltyService;
use App\Services\NoveltySummaryService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class NoveltyController extends Controller
{
    private const FILTER_KEYS = [
        'employee_id', 'novelty_type_id', 'status', 'category',
        'cost_center_id', 'date_from', 'date_to', 'search',
    ];

    public function __construct(
        private readonly NoveltyService $novelties,
        private readonly NoveltySummaryService $summary,
        private readonly NoveltyRepositoryInterface $repository,
    ) {
    }

    public function index(Request $request)
    {
        $novelties = $this->novelties->list(
            $request->only(self::FILTER_KEYS),
            $request->user(),
            (int) $request->integer('per_page', 15),
        );

        return response()->json([
            'data' => NoveltyResource::collection($novelties),
            'meta' => [
                'current_page' => $novelties->currentPage(),
                'last_page' => $novelties->lastPage(),
                'total' => $novelties->total(),
            ],
            'message' => null,
            'status' => 'success',
        ]);
    }

    /** Novedades registradas por el usuario autenticado. */
    public function mine(Request $request)
    {
        $filters = $request->only(self::FILTER_KEYS);
        $filters['requested_by'] = $request->user()->id;

        $novelties = $this->repository->paginate($filters, (int) $request->integer('per_page', 15));

        return response()->json([
            'data' => NoveltyResource::collection($novelties),
            'meta' => [
                'current_page' => $novelties->currentPage(),
                'last_page' => $novelties->lastPage(),
                'total' => $novelties->total(),
            ],
            'message' => null,
            'status' => 'success',
        ]);
    }

    /** Novedades agrupadas por colaborador, para la vista de revisión. */
    public function summary(Request $request)
    {
        return response()->json([
            'data' => $this->summary->forUser($request->only(self::FILTER_KEYS), $request->user()),
            'message' => null,
            'status' => 'success',
        ]);
    }

    public function export(Request $request)
    {
        $filters = $request->only(self::FILTER_KEYS);

        if ($request->user()->isLeader()) {
            $filters['leader_user_id'] = $request->user()->id;
        }

        $novelties = $this->repository->all($filters);

        return Excel::download(
            new NoveltiesExport($novelties),
            'consolidado_novedades_'.now()->format('Y-m-d').'.xlsx',
        );
    }

    public function store(StoreNoveltyRequest $request)
    {
        $data = $request->validatedForModel();

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('novelty-attachments', 'public');
        }

        $novelty = $this->novelties->create($data, $request->user());

        return response()->json([
            'data' => new NoveltyResource($novelty->load(['employee.costCenter', 'noveltyType', 'requestedBy'])),
            'message' => 'Novedad registrada correctamente.',
            'status' => 'success',
        ], 201);
    }

    public function show(Novelty $novelty)
    {
        $this->authorize('view', $novelty);

        return response()->json([
            'data' => new NoveltyResource($novelty->load([
                'employee.costCenter',
                'noveltyType',
                'requestedBy',
                'reviewedBy',
                'auditLogs.performedBy',
            ])),
            'message' => null,
            'status' => 'success',
        ]);
    }

    public function update(UpdateNoveltyStatusRequest $request, Novelty $novelty)
    {
        $this->authorize('review', $novelty);

        $data = $request->validated();

        $novelty = match ($data['status']) {
            'approved' => $this->novelties->approve($novelty, $request->user()),
            'rejected' => $this->novelties->reject($novelty, $request->user(), $data['rejection_reason']),
            'annulled' => $this->novelties->annul($novelty, $request->user()),
        };

        return response()->json([
            'data' => new NoveltyResource($novelty->load([
                'employee.costCenter',
                'noveltyType',
                'requestedBy',
                'reviewedBy',
                'auditLogs.performedBy',
            ])),
            'message' => 'Novedad actualizada correctamente.',
            'status' => 'success',
        ]);
    }
}
