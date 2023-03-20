<?php

/**
 * Функция для постоения древовидной структуры из плоского массива
 *
 * @param array $flatArray
 * @param int $parentId
 * @return array Буквенное значение колонки
 */
function buildTree(array $flatArray, $parentId = null) {
    $tree = array();

    // перебираем все элементы массива
    foreach ($flatArray as $item) {
        // если элемент является дочерним для текущего родительского элемента
        if ($item['parent_id'] == $parentId) {
            // строим дерево для дочернего элемента рекурсивно
            $children = buildTree($flatArray, $item['id']);
            // добавляем дочерние элементы к текущему элементу
            if ($children) {
                $item['childs'] = $children;
            }
            // добавляем текущий элемент к дереву
            $tree[] = $item;
        }
    }

    return $tree;
}


/**
 * Функция для получения буквенного представления клонки Excel
 *
 * @param int $num - Порядковый номер колонки
 * @return string Буквенное значение колонки
 */
function getExcelColumn($num) {
    $letters = range('A', 'Z');
    $result = '';
    while ($num > 0) {
        $mod = ($num - 1) % 26;
        $result = $letters[$mod] . $result;
        $num = intval(($num - $mod) / 26);
    }
    return $result;
}