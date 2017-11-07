/**
 * @file
 *   Javascript for the Google Maps API integration.
 */

/**
 * @callback googleLoadedCallback
 */

/**
 * @typedef {Object} Drupal.geolocation.google
 * @property {googleLoadedCallback[]} loadedCallbacks
 */

/**
 * @param {String} drupalSettings.geolocation.google_map_url
 */

/**
 * @name GoogleMapSettings
 * @property {String} info_auto_display
 * @property {String} marker_icon_path
 * @property {String} height
 * @property {String} width
 * @property {Number} zoom
 * @property {Number} maxZoom
 * @property {Number} minZoom
 * @property {String} type
 * @property {Boolean} scrollwheel
 * @property {Boolean} preferScrollingToZooming
 * @property {String} gestureHandling
 * @property {Boolean} panControl
 * @property {Boolean} mapTypeControl
 * @property {Boolean} scaleControl
 * @property {Boolean} streetViewControl
 * @property {Boolean} overviewMapControl
 * @property {Boolean} zoomControl
 * @property {Boolean} rotateControl
 * @property {Boolean} fullscreenControl
 * @property {Object} zoomControlOptions
 * @property {String} mapTypeId
 * @property {String} info_text
 */

/**
 * @typedef {Object} google
 * @property {GoogleMap} maps
 * @property {Object} event
 * @property {Function} addListener
 * @property {Function} addDomListener
 * @property {Function} addListenerOnce
 * @property {Function} addDomListenerOnce
 */

/**
 * @typedef {Object} GoogleMapBounds
 * @property {function():GoogleMapLatLng} getNorthEast
 * @property {function():GoogleMapLatLng} getSouthWest
 * @property {function(GoogleMapBounds):Boolean} equals
 */

/**
 * @typedef {Object} GoogleMapLatLng
 * @property {function():float} lat
 * @property {function():float} lng
 */

/**
 * @typedef {Object} GoogleMapSize
 * @property {function():float} height
 * @property {function():float} width
 */

/**
 * @typedef {Object} GoogleMapPoint
 * @property {function():float} x
 * @property {function():float} y
 */

/**
 * @typedef {Object} GoogleMapSymbolPath
 * @property {String} BACKWARD_CLOSED_ARROW
 * @property {String} BACKWARD_OPEN_ARROW
 * @property {String} CIRCLE
 * @property {String} FORWARD_CLOSED_ARROW
 * @property {String} FORWARD_OPEN_ARROW
 */

/**
 * @typedef {Object} AddressComponent
 * @property {String} long_name - Long component name
 * @property {String} short_name - Short component name
 * @property {String[]} types - Component type
 * @property {GoogleGeometry} geometry
 */

/**
 * @typedef {Object} GoogleAddress
 * @property {AddressComponent[]} address_components - Components
 * @property {String} formatted_address - Formatted address
 * @property {GoogleGeometry} geometry - Geometry
 */

/**
 * @typedef {Object} GoogleGeometry
 * @property {GoogleMapLatLng} location - Location
 * @property {String} location_type - Location type
 * @property {GoogleMapBounds} viewport - Viewport
 * @property {GoogleMapBounds} bounds - Bounds (optionally)
 */

/**
 * @typedef {Object} GoogleMapProjection
 * @property {function(GoogleMapLatLng):GoogleMapPoint} fromLatLngToPoint
 */

/**
 * @typedef {Object} GoogleMarkerSettings
 * @extends {GeolocationLocationSettings}
 *
 * Settings from https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerOptions:
 * @property {GoogleMap} map
 */

/**
 * @typedef {Object} GoogleMarker
 * @property {Function} setPosition
 * @property {Function} setMap
 * @property {Function} setIcon
 * @property {Function} getIcon
 * @property {Function} setTitle
 * @property {Function} setLabel
 * @property {Function} addListener
 * @property {function():GoogleMapLatLng} getPosition
 */

/**
 * @typedef {Object} GoogleCircle
 * @property {function():GoogleMapBounds} Circle.getBounds()
 * @property {function(GoogleMapLatLng)} Circle.setCenter()
 * @property {function(number)} Circle.setRadius()
 */

/**
 * @typedef {Object} GoogleMap
 * @property {Object} ZoomControlStyle
 * @property {String} ZoomControlStyle.LARGE
 *
 * @property {Object} ControlPosition
 * @property {String} ControlPosition.LEFT_TOP
 * @property {String} ControlPosition.TOP_LEFT
 * @property {String} ControlPosition.RIGHT_BOTTOM
 * @property {String} ControlPosition.RIGHT_CENTER
 *
 * @property {Object} MapTypeId
 * @property {String} MapTypeId.ROADMAP
 *
 * @property {Function} LatLngBounds
 *
 * @function
 * @property Map
 *
 * @function
 * @property {function({GoogleMarkerSettings}):GoogleMarker} Marker
 *
 * @function
 * @property {function(string|number|float, string|number|float):GoogleMapLatLng} LatLng
 *
 * @function
 * @property {function(string|number|float, string|number|float):GoogleMapPoint} Point
 *
 * @function
 * @property {function(string|number|float, string|number|float):GoogleMapSize} Size
 *
 * @property {GoogleMapSymbolPath} SymbolPath
 *
 * @property {function(Object):GoogleCircle} Circle
 *
 * @property {function():GoogleMapProjection} getProjection
 *
 * @property {Function} fitBounds
 *
 * @property {Function} setCenter
 * @property {Function} setZoom
 * @property {Function} getZoom
 * @property {Function} setOptions
 *
 * @property {function():GoogleMapBounds} getBounds
 * @property {function():GoogleMapLatLng} getCenter
 */

/**
 * @typedef {Object} GooglePolyline
 * @property {function(GoogleMap)} setMap
 */

/**
 * @typedef {Object} GooglePolygon
 * @property {function(GoogleMap)} setMap
 */

/**
 * @typedef {Object} GoogleMap
 * @property {function(Object):GooglePolyline} Polyline
 * @property {function(Object):GooglePolygon} Polygon
 */

/**
 * @typedef {Object} CommonMapDrawSettings
 * @property {boolean} polyline
 * @property {string} strokeColor
 * @property {string} strokeOpacity
 * @property {string} strokeWeight
 * @property {boolean} geodesic
 * @property {boolean} polygon
 * @property {string} fillColor
 * @property {string} fillOpacity
 */

(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.geolocation.google = Drupal.geolocation.google || {};

  /**
   * GeolocationGoogleMap element.
   *
   * @constructor
   * @augments {GeolocationMapBase}
   * @implements {GeolocationMapInterface}
   * @inheritDoc
   *
   * @prop {GoogleMapSettings} settings.google_map_settings - Google Map specific settings.
   */
  function GeolocationGoogleMap(mapSettings) {
    this.type = 'google_maps';

    Drupal.geolocation.GeolocationMapBase.call(this, mapSettings);

    var defaultGoogleSettings = {
      scrollwheel: false,
      panControl: false,
      mapTypeControl: true,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      rotateControl: false,
      fullscreenControl: false,
      zoomControl: true,
      mapTypeId: 'roadmap',
      zoom: 2,
      maxZoom: 20,
      minZoom: 0,
      style: [],
      gestureHandling: 'auto'
    };

    // Add any missing settings.
    this.settings.google_map_settings = $.extend(defaultGoogleSettings, this.settings.google_map_settings);

    // Set the container size.
    this.container.css({
      height: this.settings.google_map_settings.height,
      width: this.settings.google_map_settings.width
    });

    this.settings.google_map_settings.zoom = parseInt(this.settings.google_map_settings.zoom);
    this.settings.google_map_settings.maxZoom = parseInt(this.settings.google_map_settings.maxZoom);
    this.settings.google_map_settings.minZoom = parseInt(this.settings.google_map_settings.minZoom);

    this.addReadyCallback(function (map) {
      // Get the center point.
      var center = new google.maps.LatLng(map.lat, map.lng);

      /**
       * Create the map object and assign it to the map.
       */
      var googleMap = new google.maps.Map(map.container.get(0), {
        zoom: map.settings.google_map_settings.zoom,
        maxZoom: map.settings.google_map_settings.maxZoom,
        minZoom: map.settings.google_map_settings.minZoom,
        center: center,
        mapTypeId: google.maps.MapTypeId[map.settings.google_map_settings.type],
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        rotateControl: map.settings.google_map_settings.rotateControl,
        fullscreenControl: map.settings.google_map_settings.fullscreenControl,
        zoomControl: map.settings.google_map_settings.zoomControl,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE,
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: map.settings.google_map_settings.streetViewControl,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        mapTypeControl: map.settings.google_map_settings.mapTypeControl,
        scrollwheel: map.settings.google_map_settings.scrollwheel,
        disableDoubleClickZoom: map.settings.google_map_settings.disableDoubleClickZoom,
        styles: map.settings.google_map_settings.style,
        gestureHandling: map.settings.google_map_settings.gestureHandling
      });

      /** @property {GoogleMap} googleMap */
      map.googleMap = googleMap;

      google.maps.event.addListener(map.googleMap, 'click', function (event) {
        map.clickCallback(event);
      });

      google.maps.event.addListener(map.googleMap, 'rightclick', function (event) {
        map.contextClickCallback(event);
      });

      if (map.settings.google_map_settings.scrollwheel && map.settings.google_map_settings.preferScrollingToZooming) {
        map.googleMap.setOptions({scrollwheel: false});
        map.googleMap.addListener('click', function () {
          googleMap.setOptions({scrollwheel: true});
        });
      }

      google.maps.event.addListenerOnce(map.googleMap, 'tilesloaded', function () {
        map.loadedCallback();
      });
    });

    if (this.ready) {
      this.readyCallback();
    }
    else {
      var that = this;
      Drupal.geolocation.google.addLoadedCallback(function () {
        that.readyCallback();
      });

      // Load Google Maps API and execute all callbacks.
      Drupal.geolocation.google.load();
    }

  }
  GeolocationGoogleMap.prototype = Object.create(Drupal.geolocation.GeolocationMapBase.prototype);
  GeolocationGoogleMap.prototype.constructor = GeolocationGoogleMap;
  GeolocationGoogleMap.prototype.update = function (mapSettings) {
    Drupal.geolocation.GeolocationMapBase.prototype.update.call(this, mapSettings);
    this.googleMap.setOptions(mapSettings.google_map_settings);
  };
  GeolocationGoogleMap.prototype.setMapMarker = function (markerSettings) {
    if (markerSettings.setMarker === false) {
      return;
    }

    markerSettings.position = new google.maps.LatLng(parseFloat(markerSettings.position.lat), parseFloat(markerSettings.position.lng));

    markerSettings.map = this.googleMap;

    if (typeof this.settings.google_map_settings.marker_icon_path === 'string') {
      if (
        this.settings.google_map_settings.marker_icon_path
        && typeof markerSettings.icon === 'undefined'
      ) {
        markerSettings.icon = this.settings.google_map_settings.marker_icon_path;
      }
    }

    // Add the marker to the map.
    /** @type {GoogleMarker} */
    var currentMarker = new google.maps.Marker(markerSettings);

    this.mapMarkers.push(currentMarker);

    return currentMarker;
  };
  GeolocationGoogleMap.prototype.removeMapMarkers = function () {
    $.each(
      this.mapMarkers,

      /**
       * @param {integer} index - Current index.
       * @param {GoogleMarker} item - Current marker.
       */
      function (index, item) {
        item.setMap(null);
      }
    );
    this.mapMarkers = [];
  };
  GeolocationGoogleMap.prototype.fitMapToMarkers = function (locations) {

    locations = locations || this.mapMarkers;

    if (locations.length === 0) {
      return;
    }

    // A Google Maps API tool to re-center the map on its content.
    var bounds = new google.maps.LatLngBounds();

    $.each(
      locations,

      /**
       * @param {integer} index - Current index.
       * @param {GoogleMarker} item - Current marker.
       */
      function (index, item) {
        bounds.extend(item.getPosition());
      }
    );
    this.googleMap.fitBounds(bounds);
  };
  GeolocationGoogleMap.prototype.fitBoundaries = function (boundaries) {
    if (!this.googleMap.getBounds().equals(boundaries)) {
      this.googleMap.fitBounds(boundaries);
    }
  };

  /**
   * Draw a circle representing the accuracy radius of HTML5 geolocation.
   *
   * @param {GeolocationCoordinates|GoogleMapLatLng} location - Location to center on.
   * @param {int} accuracy - Accuracy in m.
   *
   * @return {GoogleCircle} - Indicator circle.
   */
  GeolocationGoogleMap.prototype.addAccuracyIndicatorCircle = function (location, accuracy) {
    return new google.maps.Circle({
      center: location,
      radius: accuracy,
      map: this.googleMap,
      fillColor: '#4285F4',
      fillOpacity: 0.15,
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      clickable: false
    });
  };

  GeolocationGoogleMap.prototype.setCenterByBehavior = function (centreBehavior) {
    centreBehavior = centreBehavior || this.centreBehavior;

    Drupal.geolocation.GeolocationMapBase.prototype.setCenterByBehavior.call(this, centreBehavior);
    switch (centreBehavior) {
      case 'preset':
        this.addReadyCallback(function (map) {
          if (map.settings.google_map_settings.zoom) {
            google.maps.event.addListenerOnce(map.googleMap, 'zoom_changed', function () {
              if (map.settings.google_map_settings.zoom < map.googleMap.getZoom()) {
                map.googleMap.setZoom(map.settings.google_map_settings.zoom);
              }
            });
          }
        });
        break;
    }
  };

  /**
   * Re-center map, draw a circle indicating accuracy and slowly fade it out.
   *
   * @param {GoogleMapLatLng} coordinates - A location (latLng) object from Google Maps API.
   * @param {int} accuracy - Accuracy in meter.
   */
  GeolocationGoogleMap.prototype.setCenterByCoordinates = function (coordinates, accuracy) {
    Drupal.geolocation.GeolocationMapBase.prototype.setCenterByCoordinates.call(this, coordinates, accuracy);

    if (typeof accuracy === 'undefined') {
      this.googleMap.setCenter(coordinates);
      return;
    }

    var circle = this.addAccuracyIndicatorCircle(coordinates, accuracy);

    // Set the zoom level to the accuracy circle's size.
    this.googleMap.fitBounds(circle.getBounds());

    // Fade circle away.
    setInterval(fadeCityCircles, 200);

    function fadeCityCircles() {
      var fillOpacity = circle.get('fillOpacity');
      fillOpacity -= 0.01;

      var strokeOpacity = circle.get('strokeOpacity');
      strokeOpacity -= 0.02;

      if (
        strokeOpacity > 0
        && fillOpacity > 0
      ) {
        circle.setOptions({fillOpacity: fillOpacity, strokeOpacity: strokeOpacity});
      }
      else {
        circle.setMap(null);
      }
    }
  };

  /**
   * @inheritDoc
   */
  GeolocationGoogleMap.prototype.addControl = function (element, positionOnMap) {
    positionOnMap = positionOnMap || google.maps.ControlPosition.TOP_LEFT;
    this.googleMap.controls[positionOnMap].push(element);
  };

  Drupal.geolocation.GeolocationGoogleMap = GeolocationGoogleMap;
  Drupal.geolocation.addMapProvider('google_maps', 'GeolocationGoogleMap');

  /**
   * Adds a callback that will be called once the maps library is loaded.
   *
   * @param {googleLoadedCallback} callback - The callback
   */
  Drupal.geolocation.google.addLoadedCallback = function (callback) {
    Drupal.geolocation.google.loadedCallbacks = Drupal.geolocation.google.loadedCallbacks || [];
    Drupal.geolocation.google.loadedCallbacks.push(callback);
  };

  /**
   * Provides the callback that is called when maps loads.
   */
  Drupal.geolocation.google.load = function () {
    // Check for Google Maps.
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      if (Drupal.geolocation.google.maps_api_loading === true) {
        return;
      }

      Drupal.geolocation.google.maps_api_loading = true;
      // Google Maps isn't loaded so lazy load Google Maps.
      // This will trigger googleCallback() again!
      if (typeof drupalSettings.geolocation.google_map_url !== 'undefined') {
        $.getScript(drupalSettings.geolocation.google_map_url)
          .done(function () {
            Drupal.geolocation.google.maps_api_loading = false;
          });
      }
      else {
        console.error('Geolocation - GoogleMapsAPI url not set.'); // eslint-disable-line no-console
      }

      return;
    }

    $.each(Drupal.geolocation.google.loadedCallbacks, function (index, callback) {
      callback();
      delete Drupal.geolocation.google.loadedCallbacks[index];
    });
  };

})(jQuery, Drupal, drupalSettings);
