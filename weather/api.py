

API_URL = 'http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query=%f,%f'

def weather(lat, lng):
    url = API_URL % (lat, lng)
    return None
