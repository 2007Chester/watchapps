<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Получить список всех категорий
     */
    public function index(Request $request)
    {
        $categories = Category::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }
}



