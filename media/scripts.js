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

/*
// This function seems to break js2-mode's indentation. :(
GEO.escape = function (s) {
    return s.replace(/&/g, '&amp;').
             replace(/\"/g, '&quot;').
             replace(/'/g, '&#39;').
             replace(/</g, '&lt;').
             replace(/>/g, '&gt;');
};
*/

// Temporary solution is not to escape anything.
GEO.escape = function (s) {
    return s;
};

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
        minGoodHours = 9,
        maxGoodHours = 17;

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
                return true;
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
              return false;
            }
            return true;
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

                if (data && !data.error && data.weather &&
                    data.temperature && data.icon) {



                    GEO.msg.message('Weather in your location: ' + GEO.escape(data.weather) +
                                    ', ' + GEO.escape(data.temperature) + ' &#xb0;C. [' +
                                    GEO.escape(data.icon) + ', ' + GEO.escape(data.isGoodWeather) + ']');

                    weatherData = data;
                    GEO.env.isGoodWeather = !!data.isGoodWeather;

                    $('#options-wrapper li.context-weather > span').html(data.weather + ' -> ' +
                                                                         (data.isGoodWeather ? 'good' : 'bad'));
                    $('#options-wrapper li.context-time > span').html(
                        GEO.context.isGoodTime() ? 'good' : 'bad');

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
                        return;
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
        },
        fetchData: function () {

            if (!latlng) {
                GEO.msg.message('User location unknown, cannot fetch data.');
                return;
            }

            var options = {
                lat: latlng.lat(),
                lng: latlng.lng()
            };

            if (GEO.env.isGoodWeather) {
                options.is_good_weather = true;
            }

            if (GEO.context.isGoodTime()) {
                options.is_good_time = true;
            }

            $.getJSON('/api/nearby', options, function (data) {

                LOG(data);

            });
        }
    };

}());

GEO.addEvents = function () {

    $('#options-button > button').click(function (e) {
        $('#options-wrapper:hidden').fadeIn();
        e.preventDefault();
    });

    $('#options-wrapper li.ok-button button').click(function (e) {
        $('#options-wrapper:visible').fadeOut();
        e.preventDefault();
    });

    $('#options-wrapper li.fetch-button button').click(function (e) {
        GEO.map.fetchData();
        e.preventDefault();
    });

};

$(document).ready(function () {
    GEO.map.init();
    GEO.addEvents();
});
