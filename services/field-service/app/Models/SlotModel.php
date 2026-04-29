<?php

namespace App\Models;

use CodeIgniter\Model;

class SlotModel extends Model
{
    protected $table = 'time_slots';
    protected $primaryKey = 'id';
    protected $allowedFields = ['field_id', 'day_of_week', 'start_time', 'end_time', 'is_available'];

    public function getSlotsByField($fieldId, $page = 1, $perPage = 10)
    {
        $builder = $this->db->table('time_slots');
        $builder->where('field_id', $fieldId);

        $total = $builder->countAllResults(false);
        $offset = ($page - 1) * $perPage;
        $data = $builder->limit($perPage, $offset)->get()->getResultArray();

        return ['data' => $data, 'total' => $total, 'page' => $page, 'per_page' => $perPage];
    }
}