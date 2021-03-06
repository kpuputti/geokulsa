from urllib2 import URLError
from urllib2 import urlopen
from xml.dom import minidom


WEATHER_CONDITIONS = {
    'clear': True,
    'cloudy': True,
    'flurries': False,
    'fog': False,
    'hazy': False,
    'mostlycloudy': True,
    'mostlysunny': True,
    'partlycloudy': True,
    'partlysunny': True,
    'rain': False,
    'sleet': False,
    'snow': False,
    'sunny': True,
    'tstorms': False,
    }

class Weather(object):

    LOOKUP_URL = 'http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query=%f,%f'
    WEATHER_URL = 'http://api.wunderground.com/auto/wui/geo/WXCurrentObXML/index.xml?query=%s'

    def __init__(self, lat, lng):
        self.lat = lat
        self.lng = lng
        self.lookup_url = self.LOOKUP_URL % (lat, lng)

    def get_weather(self):

        try:
            f = urlopen(self.lookup_url)
        except URLError:
            return dict(error='Could not get lookup data.')

        doc = minidom.parseString(f.read())
        f.close()
        if doc is None:
            return dict(error='Could not fetch lookup XML.')

        icao = self._get_icao(doc)
        if icao is None or icao == '----':
            return dict(error='Could not get icao.')

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
            return dict(error='Could not get weather data for icao %s.' % icao)

        doc = minidom.parseString(f.read())
        f.close()
        #data = dict(icao=icao, weather_url=weather_url)
        data = dict(icao=icao)

        temperatures = doc.getElementsByTagName('temp_c')
        if len(temperatures) > 0:
            data['temperature'] = temperatures[0].firstChild.nodeValue

        weather_texts = doc.getElementsByTagName('weather')
        if len(weather_texts) > 0:
            data['weather'] = weather_texts[0].firstChild.nodeValue

        icon = doc.getElementsByTagName('icon')
        if len(icon) > 0:
            data['icon'] = icon[0].firstChild.nodeValue
            data['isGoodWeather'] = WEATHER_CONDITIONS.get(data['icon'], False)

        return data
