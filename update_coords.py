import csv
import unicodedata

def normalize_string(s):
    # Remove accents and lowercase
    s = str(s).strip().lower()
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    # Replace special characters just in case
    s = s.replace("'", "").replace("-", " ")
    return s

def main():
    # Load real coordinates
    real_coords = {}
    with open('municipios.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            city_norm = normalize_string(row['nome'])
            uf = row['codigo_uf']
            # UF codes to State abbreviation mapping
            uf_map = {'51': 'MT', '50': 'MS', '52': 'GO', '53': 'DF'}
            if uf in uf_map:
                state_abbr = uf_map[uf]
                real_coords[f"{state_abbr}_{city_norm}"] = (row['latitude'], row['longitude'])
    
    # Read our target file and update
    updated_rows = []
    missing = []
    
    with open('IA/cidades_mt.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            city_norm = normalize_string(row['cidade'])
            key = f"{row['estado']}_{city_norm}"
            
            if key in real_coords:
                row['latitude'] = real_coords[key][0]
                row['longitude'] = real_coords[key][1]
            else:
                missing.append(key)
                
            updated_rows.append(row)
            
    print(f"Missing coordinates for {len(missing)} cities: {missing[:10]}...")
    print(f"Successfully updated {len(updated_rows) - len(missing)} cities.")
    
    with open('IA/cidades_mt.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_rows)

if __name__ == '__main__':
    main()
