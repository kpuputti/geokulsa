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

GEO.map = (function () {

    var map,
        latlng,

        setUserLocation = function () {

            if (geo_position_js.init()) {
                geo_position_js.getCurrentPosition(function (p) {

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
