/*jslint white: false, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global google:false, $:false, jQuery:false, geo_position_js:false*/

// Simple logger to Firebug's console.
// Wrapped with try/catch to avoid errors in other browsers.
var LOG = function (msg) {
    try {
        console.log(msg);
    } catch (e) {
        //alert(msg);
    }
};

// Namespace object for all Javascript code.
var GEO = {};

// Environment object to store globally needed variables.
GEO.env = {};

GEO.msg = (function () {

    var messageWrapper = $('#message-wrapper'),
        messageElement = $('#message'),
        timeout = 3000,
        msgTimeoutId;

    return {
        'alert': function (msg) {
            alert(msg);
        },
        message: function (msg) {

            // Clear existing timeout.
            if (msgTimeoutId) {
                clearTimeout(msgTimeoutId);
            }

            messageElement.html(msg);
            messageWrapper.fadeIn('normal', function () {
                msgTimeoutId = setTimeout(function () {
                    messageWrapper.fadeOut();
                }, timeout);
            });
        }
    };
}());

GEO.context = (function () {

    var conditions = {
            CLEAR: 'clear',
            CLOUDY: 'cloudy',
            FLURRIES: 'flurries',
            FOG: 'fog',
            HAZY: 'hazy',
            MOSTLY_CLOUDY: 'mostlycloudy',
            MOSTLY_SUNNY: 'mostlycunny',
            PARTLY_CLOUDY: 'partlycloudy',
            PARTLY_SUNNY: 'partlysunny',
            RAIN: 'rain',
            SLEET: 'sleet',
            SNOW: 'snow',
            SUNNY: 'sunny',
            THUNDERSTORMS: 'tstorms'
        },
        minGoodHours = 7,
        maxGoodHours = 21;

    return {
        isGoodWeather: function (weather) {
            switch (weather) {
              case conditions.CLEAR:
                return true;
              case conditions.CLOUDY:
                return true;
              case conditions.FLURRIES:
                return false;
              case conditions.FOG:
                return false;
              case conditions.HAZY:
                return false;
              case conditions.MOSTLY_CLOUDY:
                return false;
              case conditions.MOSTLY_SUNNY:
                return true;
              case conditions.PARTLY_CLOUDY:
                return true;
              case conditions.PARTLY_SUNNY:
                return true;
              case conditions.RAIN:
                return false;
              case conditions.SLEET:
                return false;
              case conditions.SNOW:
                return false;
              case conditions.SUNNY:
                return true;
              case conditions.THUNDERSTORMS:
                return false;
            default:
                LOG('Unknown weather: ' + weather);
                return false;
            }
        },
        isGoodTime: function () {
            var hours = (new Date()).getHours();
            if (hours < minGoodHours || hours > maxGoodHours) {
              return true;
            }
            return false;
        }
    };
}());

GEO.map = (function () {

    var map,
        latlng,
        weatherData,

        setContext = function (lat, lng) {

            $.getJSON('/api/weather', {
                lat: lat,
                lng: lng
            }, function (data) {

                var isGoodWeather;

                if (data && !data.error && data.weather && data.temperature && data.icon) {

                    weatherData = data;
                    isGoodWeather = GEO.context.isGoodWeather(data.icon);

                    GEO.msg.message('Weather in your location: ' + data.weather +
                                    ', ' + data.temperature + ' &#xb0;C. [' +
                                    data.icon + ', ' + isGoodWeather + ']');

                } else if (data && data.error) {
                    LOG('Weather error: ' + data.error);
                } else {
                    LOG('Unknown weather error.');
                }
            });
        },

        setUserLocation = function () {

            if (geo_position_js.init()) {
                geo_position_js.getCurrentPosition(function (p) {

                    // If the location is already given, return immediately.
                    // This is here because the api sometimes calls this
                    // success function several times.
                    if (latlng) {
                        return;
                    }

                    // Location successfully fetched.
                    var lat, lng;

                    try {
                        lat = parseFloat(p.coords.latitude.toFixed(2));
                        lng = parseFloat(p.coords.longitude.toFixed(2));
                    } catch (e) {
                        LOG('Invalid coordinates.');
                    }

                    LOG('Got user location: ' + lat + ', ' + lng);
                    latlng = new google.maps.LatLng(lat, lng);
                    map.panTo(latlng);
                    setContext(lat, lng);

                }, function (p) {
                    // Could not get location.
                    LOG('Could not get user location.');
                }, {
                    enableHighAccuracy: true
                });
            } else {
                GEO.msg.message('Location API not supported.');
            }
        };


    return {
        init: function () {

            // Initial map position.
            var latlng = new google.maps.LatLng(60.1847242, 24.8244935);

            map = new google.maps.Map(document.getElementById("map"), {
                'zoom': 14,
                'center': latlng,
                'mapTypeId': google.maps.MapTypeId.ROADMAP,
                'mapTypeControl': false
            });
            setUserLocation();
        }
    };

}());

$(document).ready(function () {
    GEO.map.init();
});
