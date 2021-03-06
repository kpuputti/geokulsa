# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response
from geokulsa.kulsa.api import KulsaFetcher
from geokulsa.settings import DEFAULT_NEARBY_RADIUS
from geokulsa.weather.api import Weather

import json


def index(request):
    return render_to_response('index.html', {
        'yarr': u'yarr indööd',
        })

def weather(request):

    data = dict(error='Invalid coordinates.')
    lat = request.GET.get('lat', None)
    lng = request.GET.get('lng', None)

    if lat and lng:
        try:
            lat = float(lat)
            lng = float(lng)
            data = Weather(lat, lng).get_weather()
        except ValueError:
            pass

    return HttpResponse(json.dumps(data, separators=(',', ':')),
                        mimetype='text/plain')

def nearby(request):

    data = dict(error='Invalid coordinates.')
    lat = request.GET.get('lat', None)
    lng = request.GET.get('lng', None)
    radius = request.GET.get('radius', DEFAULT_NEARBY_RADIUS)
    is_good_weather = bool(request.GET.get('is_good_weather', False))
    is_good_time = bool(request.GET.get('is_good_time', False))

    if lat and lng:
        try:
            lat = float(lat)
            lng = float(lng)
            results = KulsaFetcher(lat, lng).get_nearby_items(radius=radius,
                                                              is_good_weather=is_good_weather,
                                                              is_good_time=is_good_time)
            if results is not None:
                data = results
        except ValueError:
            pass

    return HttpResponse(json.dumps(data, separators=(',', ':')),
                        mimetype='text/plain')
