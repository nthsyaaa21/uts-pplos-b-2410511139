<?php

namespace App\Controllers;

use App\Models\FieldModel;
use CodeIgniter\RESTful\ResourceController;

class FieldController extends ResourceController
{
    protected $modelName = 'App\Models\FieldModel';
    protected $format = 'json';

    public function index()
    {
        $page = $this->request->getGet('page') ?? 1;
        $perPage = $this->request->getGet('per_page') ?? 10;
        $filters = [
            'type' => $this->request->getGet('type'),
            'location' => $this->request->getGet('location'),
        ];

        $result = $this->model->getFields($filters, $page, $perPage);
        return $this->respond($result, 200);
    }

    public function show($id = null)
    {
        $field = $this->model->find($id);
        if (!$field) return $this->failNotFound('Lapangan tidak ditemukan');
        return $this->respond($field, 200);
    }

    public function create()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['name']) || empty($data['type']) || empty($data['location']) || empty($data['price_per_hour'])) {
            return $this->fail('Semua field wajib diisi', 400);
        }

        $id = $this->model->insert($data);
        return $this->respondCreated(['id' => $id, 'message' => 'Lapangan berhasil ditambahkan']);
    }

    public function update($id = null)
    {
        $field = $this->model->find($id);
        if (!$field) return $this->failNotFound('Lapangan tidak ditemukan');

        $data = $this->request->getJSON(true);
        $this->model->update($id, $data);
        return $this->respond(['message' => 'Lapangan berhasil diupdate'], 200);
    }

    public function delete($id = null)
    {
        $field = $this->model->find($id);
        if (!$field) return $this->failNotFound('Lapangan tidak ditemukan');

        $this->model->delete($id);
        return $this->respondDeleted(['message' => 'Lapangan berhasil dihapus']);
    }
}