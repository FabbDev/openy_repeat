<?php

namespace Drupal\geolocation_geometry\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;

/**
 * Plugin implementation of the 'geolocation' field type.
 *
 * @FieldType(
 *   id = "geolocation_geometry_multi_polygon",
 *   label = @Translation("Geolocation Geometry - MultiPolygon"),
 *   description = @Translation("This field stores spatial geometry data."),
 *   default_widget = "geolocation_geometry_wkt",
 *   default_formatter = "geolocation_geometry_wkt"
 * )
 */
class GeolocationGeometryMultiPolygon extends GeolocationGeometryBase {

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $schema = parent::schema($field_definition);

    $schema['columns']['geometry']['pgsql_type'] = 'multipolygon';
    $schema['columns']['geometry']['mysql_type'] = 'multipolygon';

    return $schema;
  }

}
