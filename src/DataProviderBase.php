<?php

namespace Drupal\geolocation;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Plugin\PluginBase;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\views\ResultRow;
use Drupal\views\Plugin\views\field\FieldPluginBase;

/**
 * Class DataProviderBase.
 *
 * @package Drupal\geolocation
 */
abstract class DataProviderBase extends PluginBase implements DataProviderInterface, ContainerFactoryPluginInterface {

  /**
   * Entity field manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * Views field.
   *
   * @var \Drupal\views\Plugin\views\field\FieldPluginBase
   */
  protected $viewsField;

  /**
   * Field definition.
   *
   * @var \Drupal\Core\Field\FieldDefinitionInterface
   */
  protected $fieldDefinition;

  /**
   * Constructs a new GeocoderBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entity_field_manager
   *   Entity type manager.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityFieldManagerInterface $entity_field_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    $this->entityFieldManager = $entity_field_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_field.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getTokenHelp(FieldDefinitionInterface $fieldDefinition = NULL) {
    if (empty($fieldDefinition)) {
      $fieldDefinition = $this->fieldDefinition;
    }

    $element = [];
    $element['token_items'] = [
      '#type' => 'table',
      '#prefix' => '<h4>' . $this->t('Geolocation Item Tokens') . '</h4>',
      '#header' => [$this->t('Token'), $this->t('Description')],
    ];

    foreach ($fieldDefinition->getFieldStorageDefinition()->getColumns() as $id => $column) {
      $element['token_items'][] = [
        'token' => [
          '#plain_text' => '[geolocation_current_item:' . $id . ']',
        ],
        'description' => [
          '#plain_text' => $column['description'],
        ],
      ];
    }

    if (
      \Drupal::service('module_handler')->moduleExists('token')
      && method_exists($fieldDefinition, 'getTargetEntityTypeId')
    ) {
      // Add the token UI from the token module if present.
      $element['token_help'] = [
        '#theme' => 'token_tree_link',
        '#prefix' => '<h4>' . $this->t('Additional Tokens') . '</h4>',
        '#token_types' => [$fieldDefinition->getTargetEntityTypeId()],
        '#weight' => 100,
      ];
    }

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function replaceFieldItemTokens($text, FieldItemInterface $fieldItem) {
    $token_context['geolocation_current_item'] = $fieldItem;

    return \Drupal::token()->replace($text, $token_context, [
      'callback' => [$this, 'fieldItemTokens'],
      'clear' => TRUE,
    ]);
  }

  /**
   * Token replacement support function, callback to token replacement function.
   *
   * @param array $replacements
   *   An associative array variable containing mappings from token names to
   *   values (for use with strtr()).
   * @param array $data
   *   Current item replacements.
   * @param array $options
   *   A keyed array of settings and flags to control the token replacement
   *   process. See \Drupal\Core\Utility\Token::replace().
   */
  public function fieldItemTokens(array &$replacements, array $data, array $options) {
    if (isset($data['geolocation_current_item'])) {

      /** @var \Drupal\Core\Field\FieldItemInterface $item */
      $item = $data['geolocation_current_item'];

      foreach ($this->fieldDefinition->getFieldStorageDefinition()->getColumns() as $id => $column) {
        if (
          $item->get($id)
          && isset($replacements['[geolocation_current_item:' . $id . ']'])
        ) {
          $replacements['[geolocation_current_item:' . $id . ']'] = $item->get($id)->getValue();
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function isViewsGeoOption(FieldPluginBase $viewsField) {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getPositionsFromViewsRow(ResultRow $row, FieldPluginBase $viewsField = NULL) {
    if (empty($viewsField)) {
      $viewsField = $this->viewsField;
    }

    $positions = [];

    $entity = $viewsField->getEntity($row);

    if (isset($entity->{$viewsField->definition['field_name']})) {

      /** @var \Drupal\Core\Field\FieldItemListInterface $geo_items */
      $geo_items = $entity->{$viewsField->definition['field_name']};

      foreach ($geo_items as $item) {
        $positions[] = $this->getPositionsFromItem($item);
      }
    }

    return $positions;
  }

  /**
   * {@inheritdoc}
   */
  public function setViewsField(FieldPluginBase $viewsField) {
    $this->viewsField = $viewsField;
  }

  /**
   * {@inheritdoc}
   */
  public function setFieldDefinition(FieldDefinitionInterface $fieldDefinition) {
    $this->fieldDefinition = $fieldDefinition;
  }

  /**
   * {@inheritdoc}
   */
  public function getPositionsFromItem(FieldItemInterface $fieldItem) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getSettingsForm(array $settings, array $parents = []) {
    return [];
  }

}
