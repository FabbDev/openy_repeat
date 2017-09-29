/**
 * @file
 *   Javascript for leaflet integration.
 */

/**
 * @param {String} drupalSettings.geolocation.google_map_url
 */

/**
 * @typedef {Object} L
 * @property {Function} L
 * @property {Function} L.featureGroup
 */

/**
 * @typedef {Object} LeafletMap
 * @property {Function} tileLayer
 * @property {Function} addTo
 * @property {Function} setView
 * @property {Function} featureGroup
 * @property {Function} marker
 */

/**
 * @typedef {Object} LeafletMarker
 * @property {Function} bindPopup
 */


(function ($, Drupal) {
  'use strict';

  /**
   * GeolocationLeafletMap element.
   *
   * @constructor
   * @augments {GeolocationMapBase}
   * @implements {GeolocationMapInterface}
   * @inheritDoc
   *
   * @prop {Object} settings.leaflet_settings - Leaflet specific settings.
   */
  function GeolocationLeafletMap(mapSettings) {
    this.type = 'leaflet';

    Drupal.geolocation.GeolocationMapBase.call(this, mapSettings);

    var defaultLeafletSettings = {
      zoom: 10,
      height: '400px',
      width: '100%'
    };

    // Add any missing settings.
    this.settings.leaflet_settings = $.extend(defaultLeafletSettings, this.settings.leaflet_settings);

    // Set the container size.
    this.container.css({
      height: this.settings.leaflet_settings.height,
      width: this.settings.leaflet_settings.width
    });

    var leafletMap = L.map(this.container.get(0), {
      center: [this.lat, this.lng],
      zoom: this.settings.leaflet_settings.zoom
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    /** @property {LeafletMap} leafletMap */
    this.leafletMap = leafletMap;
    this.loadedCallback(this, this.id);

    this.readyCallback();
  }
  GeolocationLeafletMap.prototype = Object.create(Drupal.geolocation.GeolocationMapBase.prototype);
  GeolocationLeafletMap.prototype.constructor = GeolocationLeafletMap;
  GeolocationLeafletMap.prototype.setMapMarker = function (markerSettings) {
    if (markerSettings.setMarker === false) {
      return;
    }

    if (typeof markerSettings.icon === 'string') {
      markerSettings.icon = L.icon({
        iconUrl: markerSettings.icon
      });
    }

    /** @param {LeafletMarker} */
    var currentMarker = L.marker([markerSettings.position.lat, markerSettings.position.lng], markerSettings).addTo(this.leafletMap);

    currentMarker.bindPopup(markerSettings.infoWindowContent);

    this.mapMarkers.push(currentMarker);

    return currentMarker;
  };
  GeolocationLeafletMap.prototype.fitMapToMarkers = function (locations) {

    locations = locations || this.mapMarkers;

    if (locations.length === 0) {
      return;
    }

    var group = new L.featureGroup(locations);

    this.leafletMap.fitBounds(group.getBounds());
  };


  Drupal.geolocation.GeolocationLeafletMap = GeolocationLeafletMap;

})(jQuery, Drupal);
