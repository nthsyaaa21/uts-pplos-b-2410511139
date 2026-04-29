<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->resource('fields', ['controller' => 'FieldController']);
$routes->get('fields/(:num)/slots', 'SlotController::index');
$routes->post('slots', 'SlotController::create');
$routes->delete('slots/(:num)', 'SlotController::delete/$1');