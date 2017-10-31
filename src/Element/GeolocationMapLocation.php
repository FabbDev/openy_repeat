<?php

namespace Drupal\geolocation\Element;

use Drupal\Core\Render\Element;
use Drupal\Core\Render\Element\RenderElement;

/**
 * Provides a render element to display a geolocation map.
 *
 * Usage example:
 * @code
 * $form['map'] = [
 *   '#type' => 'geolocation_map_location',
 *   '#prefix' => $this->t('Geolocation Map Render Element'),
 *   '#description' => $this->t('Render element type "geolocation_map"'),
 *   '#maptype' => 'leaflet,
 *   '#centre' => [],
 *   '#id' => 'thisisanid',
 * ];
 * @endcode
 *
 * @FormElement("geolocation_map_location")
 */
class GeolocationMapLocation extends RenderElement {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {
    $class = get_class($this);

    $info = [
      '#process' => [
        [$class, 'processGroup'],
      ],
      '#pre_render' => [
        [$class, 'preRenderGroup'],
        [$this, 'preRenderLocation'],
      ],
      '#title' => NULL,
      '#position' => NULL,
      '#id' => NULL,
      '#hidden' => NULL,
      '#icon' => NULL,
      '#label' => NULL,
    ];

    return $info;
  }

  /**
   * Map element.
   *
   * @param array $render_array
   *   Element.
   *
   * @return array
   *   Renderable map.
   */
  public function preRenderLocation(array $render_array) {
    $render_array['#theme'] = 'geolocation_map_location';

    if (empty($render_array['#id'])) {
      $id = uniqid();
      $render_array['#id'] = $id;
    }

    foreach (Element::children($render_array) as $child) {
      $render_array['#children'][] = $render_array[$child];
    }

    return $render_array;
  }

}
