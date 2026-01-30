<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SalesController extends Controller
{
    public function getSalesReport(Request $request)
    {
        $range = $request->query('range', 'all'); // 'today', 'week', 'month', 'all'

        $query = Order::query();

        // Apply date range filter
        switch ($range) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'week':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', Carbon::now()->month)
                      ->whereYear('created_at', Carbon::now()->year);
                break;
            // 'all' - no filter
        }

        $orders = $query->get();

        // Calculate stats - properly filter by source field
        $posOrders = $orders->where('source', 'pos');
        $manualOrders = $orders->where('source', 'manual');
        $onlineOrders = $orders->where('source', '!=', 'pos')
                                ->where('source', '!=', 'manual')
                                ->whereNull('source') // Include orders without source (legacy online orders)
                                ->merge($orders->whereNull('source'));

        $salesData = [
            'pos' => [
                'count' => $posOrders->count(),
                'revenue' => $posOrders->sum('total_amount')
            ],
            'manual' => [
                'count' => $manualOrders->count(),
                'revenue' => $manualOrders->sum('total_amount')
            ],
            'online' => [
                'count' => $onlineOrders->count(),
                'revenue' => $onlineOrders->sum('total_amount')
            ],
            'totalDeliveryCharges' => $orders->sum('delivery_charge'),
            'totalRevenue' => $orders->sum('total_amount')
        ];

        return response()->json($salesData);
    }
}
