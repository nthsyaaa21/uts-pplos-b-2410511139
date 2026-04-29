<?php

namespace App\Models;

use CodeIgniter\Model;

class FieldModel extends Model
{
    protected $table = 'fields';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'type', 'location', 'price_per_hour', 'description'];
    protected $useTimestamps = true;

    public function getFields($filters = [], $page = 1, $perPage = 10)
    {
        $builder = $this->db->table('fields');

        if (!empty($filters['type'])) {
            $builder->where('type', $filters['type']);
        }
        if (!empty($filters['location'])) {
            $builder->like('location', $filters['location']);
        }

        $total = $builder->countAllResults(false);
        $offset = ($page - 1) * $perPage;
        $data = $builder->limit($perPage, $offset)->get()->getResultArray();

        return ['data' => $data, 'total' => $total, 'page' => $page, 'per_page' => $perPage];
    }
}