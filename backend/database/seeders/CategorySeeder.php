<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Аналоговые',   'slug' => 'analogovye',   'sort_order' => 1],
            ['name' => 'Цифровые',     'slug' => 'cifrovye',     'sort_order' => 2],
            ['name' => 'Гибридные',    'slug' => 'gibridnye',   'sort_order' => 3],
            ['name' => 'Анимационные', 'slug' => 'animacionnye', 'sort_order' => 4],
            ['name' => 'Минимальзм',   'slug' => 'minimalizm',   'sort_order' => 5],
            ['name' => 'Классические', 'slug' => 'klassicheskie','sort_order' => 6],
            ['name' => 'Спортивные',   'slug' => 'sportivnye',   'sort_order' => 7],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
        
        // Удаляем старые категории, которых нет в новом списке
        $newSlugs = array_column($categories, 'slug');
        Category::whereNotIn('slug', $newSlugs)->delete();
    }
}

