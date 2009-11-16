from geokulsa.settings import DEFAULT_NEARBY_RADIUS
from geokulsa.settings import URI_LUONTOKOHDE
from geokulsa.settings import URI_MUSEO
from geokulsa.settings import URI_RAKENNETTU_KOHDE
from geokulsa.settings import WSDL_PATH
from geokulsa.weather.api import Weather
from suds.client import Client

import os.path


class KulsaFetcher(object):

    def __init__(self, lat, lng):
        self.lat = lat
        self.lng = lng
        self.client = Client(WSDL_PATH)

    def get_nearby_items(self, radius=DEFAULT_NEARBY_RADIUS,
                         is_good_weather=False, is_good_time=False):
        results = {
            'luontokohde': {
                'fetched': False
                },
            'museo': {
                'fetched': False
                },
            'rakennettu': {
                'fetched': False
                },
            }

        if is_good_time:
            items_museo = self.client.service.getNearByThings(
                self.lat, self.lng, radius, URI_MUSEO)
            results['museo']['fetched'] = True
            results['museo']['length'] = len(items_museo)

        if is_good_weather:
            items_luontokohde = self.client.service.getNearByThings(
                self.lat, self.lng, radius, URI_LUONTOKOHDE)
            results['luontokohde']['fetched'] = True
            results['luontokohde']['length'] = len(items_luontokohde)

            items_rakennettu = self.client.service.getNearByThings(
                self.lat, self.lng, radius, URI_RAKENNETTU_KOHDE)
            results['rakennettu']['fetched'] = True
            results['rakennettu']['length'] = len(items_rakennettu)

        return results
