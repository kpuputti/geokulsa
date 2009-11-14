from xml.dom import minidom
from urllib2 import URLError
from urllib2 import urlopen


class Weather(object):

    LOOKUP_URL = 'http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query=%f,%f'
    WEATHER_URL = 'http://api.wunderground.com/auto/wui/geo/WXCurrentObXML/index.xml?query=%s'

    def __init__(self, lat, lng):
        self.lat = lat
        self.lng = lng
        self.url = self.LOOKUP_URL % (lat, lng)

    def get_weather(self):
        try:
            f = urlopen(self.url)
        except URLError:
            return None
        doc = minidom.parseString(f.read())
        icao = self._get_icao(doc)

        if icao is None:
            return {
                'error': 'Could not get icao.'
                }

        return self._get_weather(icao)

    def _get_icao(self, doc):
        icaos = doc.getElementsByTagName('icao')
        if len(icaos) > 0:
            return icaos[0].firstChild.nodeValue
        return None

    def _get_weather(self, icao):
        weather_url = self.WEATHER_URL % icao
        try:
            f = urlopen(weather_url)
        except URLError:
            return None
        doc = minidom.parseString(f.read())
        data = {
            #'url': self.url,
            'icao': icao,
            #'weather_url': weather_url,
            }

        temperatures = doc.getElementsByTagName('temp_c')
        if len(temperatures) > 0:
            data['temperature'] = temperatures[0].firstChild.nodeValue
        else:
            data['temperature'] = 'Could not get.'

        weather_texts = doc.getElementsByTagName('weather')
        if len(weather_texts) > 0:
            data['weather'] = weather_texts[0].firstChild.nodeValue
        else:
            data['weather'] = 'Could not get.'

        return data
