<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Slot routes HARUS di atas resource fields!
$routes->get('fields/(:num)/slots', 'SlotController::index/$1');
$routes->post('fields/(:num)/slots', 'SlotController::create/$1');
$routes->delete('fields/(:num)/slots/(:num)', 'SlotController::delete/$1/$2');

// Field routes
$routes->get('fields', 'FieldController::index');
$routes->post('fields', 'FieldController::create');
$routes->get('fields/(:num)', 'FieldController::show/$1');
$routes->put('fields/(:num)', 'FieldController::update/$1');
$routes->delete('fields/(:num)', 'FieldController::delete/$1');

$routes->get('health', function() {
    return Services::response()->setJSON(['status' => 'field-service OK']);
});