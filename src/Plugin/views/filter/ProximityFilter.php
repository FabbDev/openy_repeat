<?php

namespace Drupal\geolocation\Plugin\views\filter;

use Drupal\Core\Form\FormStateInterface;
use Drupal\geolocation\GeolocationCore;
use Drupal\views\Plugin\views\filter\NumericFilter;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Filter handler for search keywords.
 *
 * @ingroup views_filter_handlers
 *
 * @ViewsFilter("geolocation_filter_proximity")
 */
class ProximityFilter extends NumericFilter implements ContainerFactoryPluginInterface {

  /**
   * The GeolocationCore object.
   *
   * @var \Drupal\geolocation\GeolocationCore
   */
  protected $geolocationCore;

  /**
   * Constructs a Handler object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\geolocation\GeolocationCore $geolocation_core
   *   The GeolocationCore object.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, GeolocationCore $geolocation_core) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    $this->geolocationCore = $geolocation_core;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('geolocation.core')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function defineOptions() {
    // Add source, lat, lng and filter.
    $options = [
      'proximity_source' => ['default' => 'direct_input'],
      'proximity_lat' => ['default' => ''],
      'proximity_lng' => ['default' => ''],
      'proximity_units' => ['default' => 'km'],
      'proximity_argument' => ['default' => ''],
      'entity_id_argument' => ['default' => ''],
      'boundary_filter' => ['default' => ''],
      'client_location' => ['default' => 0],
    ] + parent::defineOptions();

    $options['expose']['contains']['input_by_geocoding_widget'] = ['default' => FALSE];

    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultExposeOptions() {
    parent::defaultExposeOptions();

    $this->options['expose']['label'] = $this->t('Distance in @units', ['@units' => $this->getProximityUnit() == 'km' ? 'kilometers' : 'miles']);
    $this->options['expose']['input_by_geocoding_widget'] = FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function buildExposeForm(&$form, FormStateInterface $form_state) {
    $form['expose']['input_by_geocoding_widget'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use Google Geocoding Widget instead of proximity value form'),
      '#default_value' => $this->options['expose']['input_by_geocoding_widget'],
      '#states' => [
        'visible' => [
          'select[name="options[proximity_source]"]' => ['value' => 'exposed'],
        ],
      ],
    ];

    parent::buildExposeForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function buildExposedForm(&$form, FormStateInterface $form_state) {

    parent::buildExposedForm($form, $form_state);

    // Get the value element.
    if (isset($form['value']['#tree'])) {
      $value_element = &$form['value'];
    }
    else {
      $value_element = &$form;
    }
    $value_element[$this->field]['#weight'] = 30;

    if ($this->options['proximity_units'] == 'exposed') {
      $value_element[$this->options['expose']['identifier'] . '-units'] = [
        '#type' => 'select',
        '#default_value' => !empty($this->value['units']) ? $this->value['units'] : '',
        '#weight' => 40,
        '#options' => [
          'mile' => $this->t('Miles'),
          'km' => $this->t('Kilometers'),
        ],
      ];
    }

    if ($this->options['proximity_source'] == 'exposed') {
      $value_element[$this->options['expose']['identifier'] . '-lat'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Latitude'),
        '#weight' => 10,
      ];

      $value_element[$this->options['expose']['identifier'] . '-lng'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Longitude'),
        '#weight' => 20,
      ];

      if (
        $this->options['expose']['input_by_geocoding_widget']
        && !empty($form[$this->field])
      ) {
        $value_element[$this->options['expose']['identifier'] . '-lat']['#type'] = 'hidden';
        $value_element[$this->options['expose']['identifier'] . '-lng']['#type'] = 'hidden';

        $value_element['proximity_geocoding_widget'] = [
          '#type' => 'textfield',
          '#title' => $this->t("Location"),
          '#description' => $this->t('Enter an address to locate.'),
          '#attributes' => [
            'class' => [
              'form-autocomplete',
              'geolocation-views-filter-geocoder',
            ],
            'data-geolocation-filter-identifier' => $this->options['expose']['identifier'],
            'data-geolocation-filter-type' => 'proximity',
          ],
          '#attached' => [
            'library' => [
              'geolocation/geolocation.views.filter.geocoder',
            ],
          ],
        ];

        $this->geolocationCore->attachGeocoder($value_element['proximity_geocoding_widget']);
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function acceptExposedInput($input) {
    $value = parent::acceptExposedInput($input);
    if (empty($value)) {
      return FALSE;
    }

    if ($this->options['proximity_source'] == 'exposed') {
      if (
        $input[$this->options['expose']['identifier'] . '-lat'] == ''
        || $input[$this->options['expose']['identifier'] . '-lng'] == ''
      ) {
        return FALSE;
      }
      else {
        $this->value['lat'] = $input[$this->options['expose']['identifier'] . '-lat'];
        $this->value['lng'] = $input[$this->options['expose']['identifier'] . '-lng'];
      }
    }

    if ($this->options['proximity_units'] == 'exposed') {
      if ($input[$this->options['expose']['identifier'] . '-units'] != 'km' && $input[$this->options['expose']['identifier'] . '-units'] != 'mile') {
        return FALSE;
      }
      else {
        $this->value['units'] = $input[$this->options['expose']['identifier'] . '-units'];
      }
    }

    return $value;
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    // Add the proximity field group.
    $form['proximity_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Proximity Source Settings'),
    ];

    $form['proximity_source'] = [
      '#type' => 'select',
      '#title' => $this->t('Select the source type.'),
      '#description' => $this->t('To calculate proximity we need a starting point to compare the field value to. Select where to get the start location.'),
      '#default_value' => $this->options['proximity_source'],
      '#fieldset' => 'proximity_group',
      '#options' => [
        'direct_input' => $this->t('Static Values'),
      ],
    ];

    if ($this->isExposed()) {
      $form['proximity_source']['#options']['exposed'] = $this->t('Expose in & retrieve from exposed form');
    }

    /*
     * Direct input form elements.
     */
    $form['proximity_lat'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Latitude'),
      '#empty_value' => '',
      '#default_value' => $this->options['proximity_lat'],
      '#maxlength' => 255,
      '#fieldset' => 'proximity_group',
      '#states' => [
        'visible' => [
          'select[name="options[proximity_source]"]' => ['value' => 'direct_input'],
        ],
      ],
    ];
    $form['proximity_lng'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Longitude'),
      '#empty_value' => '',
      '#default_value' => $this->options['proximity_lng'],
      '#maxlength' => 255,
      '#fieldset' => 'proximity_group',
      '#states' => [
        'visible' => [
          'select[name="options[proximity_source]"]' => ['value' => 'direct_input'],
        ],
      ],
    ];

    /*
     * Proximity contextual filter form elements.
     */
    $proximity_arguments = [];

    /** @var \Drupal\views\Plugin\views\argument\ArgumentPluginBase $argument */
    foreach ($this->displayHandler->getHandlers('argument') as $delta => $argument) {
      if ($argument->getPluginId() === 'geolocation_argument_proximity') {
        $proximity_arguments[$delta] = $argument->adminLabel();
      }
    }

    if (!empty($proximity_arguments)) {
      $form['proximity_argument'] = [
        '#type' => 'select',
        '#title' => $this->t('Select contextual filter (argument).'),
        '#description' => $this->t('Select the contextual filter (argument) to use as the starting point for calculating proximity.'),
        '#options' => $proximity_arguments,
        '#default_value' => $this->options['proximity_argument'],
        '#fieldset' => 'proximity_group',
        '#states' => [
          'visible' => [
            'select[name="options[proximity_source]"]' => ['value' => 'argument'],
          ],
        ],
      ];

      $form['proximity_source']['#options']['argument'] = $this->t('Proximity Contextual Filter');
    }

    /*
     * Available boundary filters form elements.
     */
    $boundary_filters = [];

    /** @var \Drupal\views\Plugin\views\filter\FilterPluginBase $filter */
    foreach ($this->displayHandler->getHandlers('filter') as $delta => $filter) {
      if ($filter->pluginId === 'geolocation_filter_boundary') {
        $boundary_filters[$delta] = $filter->adminLabel();
      }
    }

    if (!empty($boundary_filters)) {
      $form['boundary_filter'] = [
        '#type' => 'select',
        '#title' => $this->t('Select filter.'),
        '#description' => $this->t('Select the boundary filter to use as the starting point for calculating proximity.'),
        '#options' => $boundary_filters,
        '#default_value' => $this->options['boundary_filter'],
        '#fieldset' => 'proximity_group',
        '#states' => [
          'visible' => [
            'select[name="options[proximity_source]"]' => ['value' => 'boundary_filter'],
          ],
        ],
      ];

      $form['proximity_source']['#options']['boundary_filter'] = $this->t('Boundary Filter');
    }

    /*
     * Entity ID contextual filter form elements.
     */
    $entity_id_arguments = [];

    /** @var \Drupal\views\Plugin\views\argument\ArgumentPluginBase $argument */
    foreach ($this->displayHandler->getHandlers('argument') as $delta => $argument) {
      $entity_id_arguments[$delta] = $argument->adminLabel();
    }

    $entity_type_label = \Drupal::entityTypeManager()
      ->getDefinition($this->getEntityType())
      ->getLabel();
    if (!empty($entity_id_arguments)) {
      $form['entity_id_argument'] = [
        '#type' => 'select',
        '#title' => $this->t('Select a contextual filter returning the !entity_type ID to base proximity on.', ['!entity_type' => $entity_type_label]),
        '#description' => $this->t(
          'The value of the !field_name field of this !entity_type will be used as center for distance values.',
          [
            '!entity_type' => $entity_type_label,
            '!field_name' => $this->field,
          ]
        ),
        '#options' => $entity_id_arguments,
        '#default_value' => $this->options['entity_id_argument'],
        '#fieldset' => 'proximity_group',
        '#states' => [
          'visible' => [
            'select[name="options[proximity_source]"]' => ['value' => 'entity_id_argument'],
          ],
        ],
      ];

      $form['proximity_source']['#options']['entity_id_argument'] = $this->t('Entity ID Contextual Filter');
    }

    $proximity_units_options = [
      'mile' => $this->t('Miles'),
      'km' => $this->t('Kilometers'),
    ];

    if ($this->isExposed()) {
      $proximity_units_options['exposed'] = $this->t('Expose in & retrieve from exposed form');
    }

    if ($this->options['proximity_source'] == 'argument') {
      $proximity_units_options['argument'] = $this->t('Derive from contextual proximity filter');
    }

    $form['proximity_units'] = [
      '#type' => 'select',
      '#title' => $this->t('Units'),
      '#default_value' => !empty($this->options['proximity_units']) ? $this->options['proximity_units'] : '',
      '#weight' => 40,
      '#fieldset' => 'proximity_group',
      '#options' => $proximity_units_options,
      '#states' => [
        'visible' => [
          [
            ['select[name="options[proximity_source]"]' => ['value' => 'direct_input']],
            'or',
            ['select[name="options[proximity_source]"]' => ['value' => 'exposed']],
            'or',
            ['select[name="options[proximity_source]"]' => ['value' => 'boundary_filter']],
            'or',
            ['select[name="options[proximity_source]"]' => ['value' => 'entity_id_argument']],
          ],
        ],
      ],
    ];

    parent::buildOptionsForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function query() {
    $table = $this->ensureMyTable();

    // Get the field alias.
    $lat = $this->getLatitudeValue();
    $lng = $this->getLongitudeValue();

    if (
      !is_numeric($lat)
      || !is_numeric($lng)
      || !is_numeric($this->value['value'])
    ) {
      return;
    }

    // Get the earth radius from the units.
    $earth_radius = $this->getProximityUnit() === 'mile' ? GeolocationCore::EARTH_RADIUS_MILE : GeolocationCore::EARTH_RADIUS_KM;

    // Build the query expression.
    $expression = $this->geolocationCore->getProximityQueryFragment($table, $this->realField, $lat, $lng, $earth_radius);

    // Get operator info.
    $info = $this->operators();

    // Make sure a callback exists and add a where expression for the chosen
    // operator.
    if (!empty($info[$this->operator]['method']) && method_exists($this, $info[$this->operator]['method'])) {
      $this->{$info[$this->operator]['method']}($expression);
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function opBetween($expression) {
    /** @var \Drupal\views\Plugin\views\query\Sql $query */
    $query = $this->query;
    if ($this->operator == 'between') {
      $query->addWhereExpression($this->options['group'], $expression . ' BETWEEN ' . $this->value['min'] . ' AND ' . $this->value['max']);
    }
    else {
      $query->addWhereExpression($this->options['group'], $expression . ' NOT BETWEEN ' . $this->value['min'] . ' AND ' . $this->value['max']);
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function opSimple($expression) {
    /** @var \Drupal\views\Plugin\views\query\Sql $query */
    $query = $this->query;
    $query->addWhereExpression($this->options['group'], $expression . ' ' . $this->operator . ' ' . $this->value['value']);
  }

  /**
   * {@inheritdoc}
   */
  protected function opEmpty($expression) {
    /** @var \Drupal\views\Plugin\views\query\Sql $query */
    $query = $this->query;
    if ($this->operator == 'empty') {
      $operator = "IS NULL";
    }
    else {
      $operator = "IS NOT NULL";
    }

    $query->addWhereExpression($this->options['group'], $expression . ' ' . $operator);
  }

  /**
   * {@inheritdoc}
   */
  protected function opRegex($expression) {
    /** @var \Drupal\views\Plugin\views\query\Sql $query */
    $query = $this->query;
    $query->addWhereExpression($this->options['group'], $expression . ' ~* ' . $this->value['value']);
  }

  /**
   * Retrieve latitude value from configured source.
   *
   * @return float|null
   *   Latitude value.
   */
  protected function getLatitudeValue() {
    $proximity_center = $this->getProximityCenterBySource();
    if (!is_null($proximity_center['latitude'])) {
      return $proximity_center['latitude'];
    }
    return NULL;
  }

  /**
   * Retrieve longitude value from configured source.
   *
   * @return float|null
   *   Longitude value.
   */
  protected function getLongitudeValue() {
    $proximity_center = $this->getProximityCenterBySource();
    if (!is_null($proximity_center['longitude'])) {
      return $proximity_center['longitude'];
    }
    return NULL;
  }

  /**
   * Retrieve proximity center data from configured source.
   *
   * @return array
   *   Proximity Center data.
   */
  protected function getProximityCenterBySource() {
    switch ($this->options['proximity_source']) {
      case 'boundary_filter':
        $filter = $this->view->filter[$this->options['boundary_filter']];

        // See documentation at
        // http://tubalmartin.github.io/spherical-geometry-php/#LatLngBounds
        $proximity_center = [
          'latitude' => ($filter->value['lat_south_west'] + $filter->value['lat_north_east']) / 2,
          'longitude' => ($filter->value['lng_south_west'] + $filter->value['lng_north_east']) / 2,
        ];
        if ($filter->value['lng_south_west'] > $filter->value['lng_north_east']) {
          $proximity_center['longitude'] = $proximity_center['longitude'] == 0 ? 180 : fmod((fmod((($proximity_center['longitude'] + 180) - -180), 360) + 360), 360) + -180;
        }
        break;

      case 'argument':
        /** @var \Drupal\geolocation\Plugin\views\argument\ProximityArgument $argument */
        $argument = $this->view->argument[$this->options['proximity_argument']];
        $values = $argument->getParsedReferenceLocation();

        $proximity_center = [
          'latitude' => $values['lat'],
          'longitude' => $values['lng'],
          'units' => $values['units'],
        ];
        break;

      case 'entity_id_argument':
        $argument = $this->view->argument[$this->options['entity_id_argument']];
        if (empty($argument)) {
          return [];
        }
        $entity_id = $argument->getValue();
        if (!ctype_digit($entity_id)) {
          return [];
        }
        /** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
        $entity = \Drupal::entityTypeManager()->getStorage($this->getEntityType())->load($entity_id);
        if (!$entity->hasField($this->realField)) {
          return [];
        }
        $field = $entity->get($this->realField);
        if (empty($field)) {
          return [];
        }
        $values = $field->getValue();
        if (empty($values)) {
          return [];
        }
        $values = reset($values);

        $proximity_center = [
          'latitude' => $values['lat'],
          'longitude' => $values['lng'],
        ];
        break;

      case 'client_location':
      case 'exposed':
        $proximity_center = [
          'latitude' => $this->value['lat'],
          'longitude' => $this->value['lng'],
        ];
        break;

      default:
        $proximity_center = [
          'latitude' => $this->options['proximity_lat'],
          'longitude' => $this->options['proximity_lng'],
        ];
    }

    return $proximity_center;
  }

  /**
   * Retrieve proximity unit from configured source.
   *
   * @return string
   *   Proximity unit.
   */
  protected function getProximityUnit() {
    switch ($this->options['proximity_units']) {
      case 'exposed':
        if (!empty($this->value['units'])) {
          return $this->value['units'];
        }
        break;

      case 'argument':
        $proximity_center = $this->getProximityCenterBySource();
        if (!empty($proximity_center['unit'])) {
          return $proximity_center['unit'];
        }
        break;

      default:
        return $this->options['proximity_units'];
    }

    return 'km';
  }

}
