import csv
import gzip
import time
import urllib.request
import urllib.parse
import json

UF_CODIGOS = {
    'MT': 51,
    'MS': 50,
    'GO': 52,
    'DF': 53,
}

IBGE_MUNICIPIOS_UF = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/{}/municipios'
NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'


def get_json(url):
    req = urllib.request.Request(url, headers={'Accept-Encoding': 'gzip', 'User-Agent': 'IA/centro-oeste/1.0'})
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        if resp.getheader('Content-Encoding') == 'gzip':
            raw = gzip.decompress(raw)
        return json.loads(raw.decode('utf-8'))


def geocode_city(city, estado):
    params = {
        'q': f'{city}, {estado}, Brasil',
        'format': 'json',
        'limit': 1,
    }
    url = NOMINATIM_URL + '?' + urllib.parse.urlencode(params)
    try:
        result = get_json(url)
        if result:
            return float(result[0]['lat']), float(result[0]['lon'])
    except Exception as exc:
        print('Erro geocoding', city, estado, exc)
    return None, None


def main():
    all_rows = []
    for uf, code in UF_CODIGOS.items():
        url = IBGE_MUNICIPIOS_UF.format(code)
        print('Buscando municípios IBGE', uf, url)
        municipios = get_json(url)

        for m in municipios:
            name = m['nome']
            lat, lon = geocode_city(name, uf)
            all_rows.append({
                'cidade': name,
                'latitude': '' if lat is None else f'{lat:.6f}',
                'longitude': '' if lon is None else f'{lon:.6f}',
                'consumo_mwh': '',
                'populacao': '',
            })
            print('  ', uf, name, '->', lat, lon)
            time.sleep(1.5)  # respeitar uso do Nominatim

    output_file = 'cidades_centro_oeste.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['cidade', 'latitude', 'longitude', 'consumo_mwh', 'populacao'])
        writer.writeheader()
        writer.writerows(all_rows)

    print('Arquivo gerado:', output_file, 'with', len(all_rows), 'cidades')


if __name__ == '__main__':
    main()
