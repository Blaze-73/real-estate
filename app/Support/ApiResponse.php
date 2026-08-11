<?php

namespace App\Support;

use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    public static function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'page' => $paginator->currentPage(),
            'pages' => $paginator->lastPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ];
    }

    public static function paginate(LengthAwarePaginator $paginator, mixed $items = null): array
    {
        return [
            'data' => $items ?? $paginator->items(),
            'pagination' => self::paginationMeta($paginator),
        ];
    }
}