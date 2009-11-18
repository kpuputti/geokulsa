from geokulsa.settings import DEFAULT_NEARBY_RADIUS
from geokulsa.settings import URI_LUONTOKOHDE
from geokulsa.settings import URI_MUSEO
from geokulsa.settings import URI_RAKENNETTU_KOHDE
from geokulsa.settings import WSDL_PATH
from geokulsa.kulsa.test_data import TEST_DATA
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
                'fetched': False,
                'data': [],
                },
            'museo': {
                'fetched': False,
                'data': [],
                },
            'rakennettu': {
                'fetched': False,
                'data': [],
                },
            }

        if is_good_time:
            items_museo = self.client.service.getNearByThings(
                self.lat, self.lng, radius, URI_MUSEO)
            results['museo']['fetched'] = True
            results['museo']['length'] = len(items_museo)

            if len(items_museo) > 0:
                im =  items_museo[0]
                results['museo']['data'].append([dict(i) for i in im])

            if len(items_museo) == 0:
                results['museo']['length'] = len(items_museo)
                #results['museo']['data'] = TEST_DATA['museo']

        if is_good_weather:
            items_luontokohde = self.client.service.getNearByThings(
                self.lat, self.lng, radius, URI_LUONTOKOHDE)
            results['luontokohde']['fetched'] = True
            results['luontokohde']['length'] = len(items_luontokohde)

            if len(items_luontokohde) > 0:
                il =  items_luontokohde[0]
                results['luontokohde']['data'].append([dict(i) for i in il])

            if len(items_luontokohde) == 0:
                results['luontokohde']['length'] = len(items_luontokohde)
                #results['luontokohde']['data'] = TEST_DATA['luontokohde']

            items_rakennettu = self.client.service.getNearByThings(
                self.lat, self.lng, radius, URI_RAKENNETTU_KOHDE)
            results['rakennettu']['fetched'] = True
            results['rakennettu']['length'] = len(items_rakennettu)

            if len(items_rakennettu) > 0:
                ir =  items_rakennettu[0]
                results['rakennettu']['data'].append([dict(i) for i in ir])

            if len(items_rakennettu) == 0:
                results['rakennettu']['length'] = len(items_rakennettu)
                #results['rakennettu']['data'] = TEST_DATA['rakennettu']

        return results
