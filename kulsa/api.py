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

    def get_nearby_items(self, radius=DEFAULT_NEARBY_RADIUS, item_type=URI_MUSEO):
        return self.client.service.getNearByThings(self.lat, self.lng, radius, item_type)
