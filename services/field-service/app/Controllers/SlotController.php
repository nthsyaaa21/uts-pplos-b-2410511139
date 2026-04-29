<?php

namespace App\Controllers;

use App\Models\SlotModel;
use CodeIgniter\RESTful\ResourceController;

class SlotController extends ResourceController
{
    protected $modelName = 'App\Models\SlotModel';
    protected $format = 'json';

    public function index()
    {
        $fieldId = $this->request->getGet('field_id');
        $page = $this->request->getGet('page') ?? 1;
        $perPage = $this->request->getGet('per_page') ?? 10;

        if (!$fieldId) return $this->fail('field_id wajib diisi', 400);

        $result = $this->model->getSlotsByField($fieldId, $page, $perPage);
        return $this->respond($result, 200);
    }

    public function create()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['field_id']) || empty($data['day_of_week']) || empty($data['start_time']) || empty($data['end_time'])) {
            return $this->fail('Semua field wajib diisi', 400);
        }

        $id = $this->model->insert($data);
        return $this->respondCreated(['id' => $id, 'message' => 'Slot berhasil ditambahkan']);
    }

    public function delete($id = null)
    {
        $slot = $this->model->find($id);
        if (!$slot) return $this->failNotFound('Slot tidak ditemukan');

        $this->model->delete($id);
        return $this->respondDeleted(['message' => 'Slot berhasil dihapus']);
    }
}