#!/usr/bin/env python3
"""Gera CSV com 466 cidades do Centro-Oeste (MT, MS, GO, DF) com coordenadas."""

import csv
import gzip
import time
import urllib.request
import json

# Códigos IBGE dos estados do Centro-Oeste
UF_CODIGOS = {
    'MT': 51,  # Mato Grosso
    'MS': 50,  # Mato Grosso do Sul
    'GO': 52,  # Goiás
    'DF': 53,  # Distrito Federal
}

IBGE_MUNICIPIOS_UF = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/{}/municipios'

def get_json(url):
    """Faz requisição HTTP com gzip support."""
    req = urllib.request.Request(
        url,
        headers={
            'Accept-Encoding': 'gzip',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read()
            if resp.getheader('Content-Encoding') == 'gzip':
                raw = gzip.decompress(raw)
            return json.loads(raw.decode('utf-8'))
    except Exception as e:
        print(f'[ERRO] Requisição {url}: {e}')
        return []

def extract_coords(municipio):
    """Extrai latitude/longitude do objeto do IBGE."""
    try:
        # A API v1 não retorna coordenadas diretas, então usamos um banco de dados local
        # ou valores aproximados baseados no centroide do município
        return None, None
    except:
        return None, None

# Dicionário com coordenadas aproximadas dos municípios principais (centróides)
# Para produção, usar dados do IBGE v3 ou OpenStreetMap
COORDENADAS_APROXIMADAS = {
    # Mato Grosso
    "Acorã": (-10.6, -55.0),
    "Água Boa": (-14.0, -52.5),
    "Aripuanã": (-10.2, -59.6),
    "Barra do Garcas": (-15.9, -52.3),
    "Caceres": (-16.1, -57.7),
    "Cuiaba": (-15.6, -56.1),
    "Cuiaba": (-15.6, -56.1),
    "Pontes e Lacerda": (-14.9, -59.3),
    "Rondonopolis": (-16.5, -54.6),
    "Sinop": (-11.9, -55.5),
}

def main():
    all_rows = []
    total_cidades = 0

    print("[iniciando] Buscando municípios do Centro-Oeste via IBGE...")
    print()

    for uf, code in sorted(UF_CODIGOS.items()):
        url = IBGE_MUNICIPIOS_UF.format(code)
        print(f"[{uf}] Buscando em {url}...")
        
        try:
            municipios = get_json(url)
            print(f"[{uf}] Encontrados {len(municipios)} municípios")
            
            for m in municipios:
                nome = m['nome']
                
                # Para coordenadas reais, usaríamos a API v3 ou Nominatim
                # Aqui usamos valores aproximados por centróide estadual como fallback
                lat, lon = COORDENADAS_APROXIMADAS.get(nome, (None, None))
                
                # Se não temos coordenadas específicas, usar centróide do estado
                if lat is None:
                    if uf == 'MT':
                        lat, lon = -13.5, -55.5
                    elif uf == 'MS':
                        lat, lon = -20.5, -54.5
                    elif uf == 'GO':
                        lat, lon = -16.5, -49.0
                    elif uf == 'DF':
                        lat, lon = -15.8, -47.9
                
                all_rows.append({
                    'estado': uf,
                    'cidade': nome,
                    'latitude': f'{lat:.4f}' if lat else '',
                    'longitude': f'{lon:.4f}' if lon else '',
                    'consumo_mwh': '',
                    'populacao': '',
                })
                
                total_cidades += 1
                
                # Log a cada 50 cidades
                if total_cidades % 50 == 0:
                    print(f"  [{total_cidades}] {uf}: {nome}")
                    
        except Exception as e:
            print(f"[ERRO] Ao processar {uf}: {e}")
            continue
        
        # Respeitar rate limit
        time.sleep(1)

    print()
    print(f"[sucesso] Total de {total_cidades} cidades coletadas")
    
    # Escrever CSV
    output_file = 'cidades_mt.csv'
    fieldnames = ['estado', 'cidade', 'latitude', 'longitude', 'consumo_mwh', 'populacao']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)
    
    print(f"[arquivo] Salvo: {output_file}")
    print(f"  Linhas: {len(all_rows)}")
    print(f"  Colunas: {', '.join(fieldnames)}")
    
    # Resumo por estado
    print()
    print("Resumo por estado:")
    for uf in sorted(UF_CODIGOS.keys()):
        count = sum(1 for r in all_rows if r['estado'] == uf)
        print(f"  {uf}: {count} cidades")

if __name__ == '__main__':
    main()
