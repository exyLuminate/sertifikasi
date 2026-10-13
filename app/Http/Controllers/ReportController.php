<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ReportController — Mengelola tampilan laporan operasional dan ekspor PDF (Unit 5 & 6).
 */
class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Tampilkan halaman laporan operasional dengan filter periode.
     */
    public function index(Request $request): Response
    {
        [$from, $to, $period] = $this->resolveDateRange($request);

        $summary = $this->reportService->reservationSummary($from, $to);
        $tableUsage = $this->reportService->reservationsPerTable($from, $to);
        $dailyReservations = $this->reportService->dailyReservations($from, $to);
        $topMenus = $this->reportService->topMenus($from, $to);
        $revenue = $this->reportService->revenue($from, $to);
        $staffPerformance = $this->reportService->staffPerformance($from, $to);

        return Inertia::render('Admin/Reports/Index', [
            'period' => $period,
            'from' => $from->format('Y-m-d'),
            'to' => $to->format('Y-m-d'),
            'summary' => $summary,
            'tableUsage' => $tableUsage,
            'dailyReservations' => $dailyReservations,
            'topMenus' => $topMenus,
            'revenue' => $revenue,
            'staffPerformance' => $staffPerformance,
        ]);
    }

    /**
     * Unduh laporan operasional dalam format PDF.
     */
    public function exportPdf(Request $request)
    {
        [$from, $to, $period] = $this->resolveDateRange($request);

        $summary = $this->reportService->reservationSummary($from, $to);
        $tableUsage = $this->reportService->reservationsPerTable($from, $to);
        $topMenus = $this->reportService->topMenus($from, $to);
        $revenue = $this->reportService->revenue($from, $to);
        $staffPerformance = $this->reportService->staffPerformance($from, $to);

        $pdf = Pdf::loadView('pdf.report', [
            'from' => $from,
            'to' => $to,
            'period' => $period,
            'summary' => $summary,
            'tableUsage' => $tableUsage,
            'topMenus' => $topMenus,
            'revenue' => $revenue,
            'staffPerformance' => $staffPerformance,
        ])->setPaper('a4', 'portrait');

        $fileName = sprintf('laporan-restoran-%s-sd-%s.pdf', $from->format('Ymd'), $to->format('Ymd'));

        return $pdf->download($fileName);
    }

    /**
     * Parse periode atau rentang tanggal dari request.
     *
     * @return array{0: Carbon, 1: Carbon, 2: string}
     */
    protected function resolveDateRange(Request $request): array
    {
        $period = $request->input('period', 'today');

        return match ($period) {
            '7_days' => [
                now()->subDays(6)->startOfDay(),
                now()->endOfDay(),
                '7_days',
            ],
            'this_month' => [
                now()->startOfMonth(),
                now()->endOfMonth(),
                'this_month',
            ],
            'custom' => [
                $request->filled('from') ? Carbon::parse($request->input('from'))->startOfDay() : now()->startOfDay(),
                $request->filled('to') ? Carbon::parse($request->input('to'))->endOfDay() : now()->endOfDay(),
                'custom',
            ],
            default => [
                now()->startOfDay(),
                now()->endOfDay(),
                'today',
            ],
        };
    }
}
