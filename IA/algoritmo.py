from __future__ import annotations

import csv
import math
import random
from collections import deque
from typing import Iterator, Optional

import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


class Graph:
    """Graph representing cities with geographic coordinates."""

    def __init__(self) -> None:
        self.adj_list: dict[str, list[str]] = {}
        self.cities: dict[str, tuple[float, float]] = {}  # name -> (lat, lon)
        self.city_states: dict[str, str] = {}  # name -> state (UF)

    def add_city(self, name: str, lat: float, lon: float, state: str = "") -> None:
        """Add a city to the graph."""
        self.cities[name] = (lat, lon)
        self.city_states[name] = state
        if name not in self.adj_list:
            self.adj_list[name] = []

    def add_edge(self, u: str, v: str) -> None:
        """Add an undirected edge between u and v."""
        if u in self.adj_list and v in self.adj_list:
            if v not in self.adj_list[u]:
                self.adj_list[u].append(v)
            if u not in self.adj_list[v]:
                self.adj_list[v].append(u)

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates in km."""
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    def build_neighbors(self, max_distance: float = 300) -> None:
        """Connect cities that are within max_distance km."""
        cities_list = list(self.cities.items())
        for i, (city1, (lat1, lon1)) in enumerate(cities_list):
            for city2, (lat2, lon2) in cities_list[i + 1 :]:
                dist = self.haversine_distance(lat1, lon1, lat2, lon2)
                if dist <= max_distance:
                    self.add_edge(city1, city2)

    def bfs(self, start: str, target: str) -> dict:
        """Busca em Largura (BFS) que encontra o alvo e retorna sequência visitada e caminho."""
        if start not in self.cities:
            return {"found": False, "visited": [], "path": []}

        visited_order = []
        visited = {start}
        queue = deque([start])
        parent = {start: None}

        while queue:
            node = queue.popleft()
            visited_order.append(node)

            if node == target:
                # Reconstruct path
                path = []
                current = target
                while current is not None:
                    path.append(current)
                    current = parent[current]
                return {
                    "found": True,
                    "visited": visited_order,
                    "path": path[::-1],
                }

            for neighbor in self.adj_list.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    parent[neighbor] = node

        return {"found": False, "visited": visited_order, "path": []}

    def dfs(self, start: str, target: str) -> dict:
        """Busca em Profundidade (DFS) que encontra o alvo e retorna sequência visitada e caminho."""
        if start not in self.cities:
            return {"found": False, "visited": [], "path": []}

        visited_order = []
        visited = set()
        stack = [start]
        parent = {start: None}

        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                visited_order.append(node)

                if node == target:
                    # Reconstruct path
                    path = []
                    current = target
                    while current is not None:
                        path.append(current)
                        current = parent[current]
                    return {
                        "found": True,
                        "visited": visited_order,
                        "path": path[::-1],
                    }

                for neighbor in reversed(self.adj_list.get(node, [])):
                    if neighbor not in visited and neighbor not in parent:
                        parent[neighbor] = node
                        stack.append(neighbor)

        return {"found": False, "visited": visited_order, "path": []}

    def bfs_steps(self, start: str, target: str) -> Iterator[dict]:
        """Gera frames de animação para Busca em Largura."""
        if start not in self.cities:
            return

        visited_order = []
        visited = {start}
        queue = deque([start])
        parent = {start: None}

        while queue:
            node = queue.popleft()
            visited_order.append(node)
            
            yield {
                "current": node,
                "visited": set(visited_order),
                "found": node == target,
            }

            if node == target:
                break

            for neighbor in self.adj_list.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    parent[neighbor] = node

    def dfs_steps(self, start: str, target: str) -> Iterator[dict]:
        """Gera frames de animação para Busca em Profundidade."""
        if start not in self.cities:
            return

        visited_order = []
        visited = set()
        stack = [start]
        parent = {start: None}

        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                visited_order.append(node)
                
                yield {
                    "current": node,
                    "visited": set(visited_order),
                    "found": node == target,
                }

                if node == target:
                    break

                for neighbor in reversed(self.adj_list.get(node, [])):
                    if neighbor not in visited and neighbor not in parent:
                        parent[neighbor] = node
                        stack.append(neighbor)

    def _decode_chromosome(self, start: str, target: str, chromosome: list[int]) -> list[str]:
        """Decode a binary chromosome into a path."""
        path = [start]
        current = start
        
        # Lemos em blocos de 3 bits (valores de 0 a 7) para decidir o próximo vizinho
        for i in range(0, len(chromosome), 3):
            if current == target:
                break
                
            chunk = chromosome[i:i+3]
            if len(chunk) < 3:
                break
                
            # Converte binário para inteiro (0-7)
            val = (chunk[0] << 2) | (chunk[1] << 1) | chunk[2]
            
            neighbors = self.adj_list.get(current, [])
            if not neighbors:
                break
                
            # Evita voltar imediatamente para a cidade anterior (loop bobo) se houver outras opções
            valid_neighbors = neighbors
            if len(path) > 1 and len(neighbors) > 1:
                valid_neighbors = [n for n in neighbors if n != path[-2]]
                
            if not valid_neighbors:
                valid_neighbors = neighbors # fallback
                
            next_node = valid_neighbors[val % len(valid_neighbors)]
            path.append(next_node)
            current = next_node
            
        return path

    def _fitness(self, path: list[str], target: str) -> float:
        """Calculate fitness of a path. Maior é melhor."""
        # Penaliza caminhos que ficam dando voltas na mesma cidade
        unique_nodes = len(set(path))
        penalty = len(path) - unique_nodes
        
        last_node = path[-1]
        if last_node == target:
            # Recompensa caminhos curtos que acham o destino, e pune ciclos duramente
            return 10000.0 + (100.0 / len(path)) - (penalty * 50)
            
        # Punição por distância
        lat1, lon1 = self.cities[last_node]
        lat2, lon2 = self.cities[target]
        dist = self.haversine_distance(lat1, lon1, lat2, lon2)
        
        # O penalty aqui diminui a chance de o indivíduo "loopador" ser selecionado
        return 1000.0 / (1.0 + dist + (penalty * 20))

    def genetic_search_steps(self, start: str, target: str, pop_size: int = 100, generations: int = 50, max_steps: int = 50) -> Iterator[dict]:
        """Busca Genética Binária que gera frames para animação a cada geração."""
        chromosome_length = max_steps * 3
        
        population = []
        for _ in range(pop_size):
            population.append([random.randint(0, 1) for _ in range(chromosome_length)])
            
        best_overall_fitness = -1.0
        best_overall_path = []
        found = False
        stagnant_gens = 0
        last_best_fitness = -1.0
        
        for gen in range(generations):
            pop_fitness = []
            for chromo in population:
                path = self._decode_chromosome(start, target, chromo)
                fit = self._fitness(path, target)
                pop_fitness.append((fit, chromo, path))
                
                if fit > best_overall_fitness:
                    best_overall_fitness = fit
                    best_overall_path = path
                    
            # Checa se o melhor caminho global alcançou o alvo
            if best_overall_path and best_overall_path[-1] == target:
                found = True
                
            # Verifica estagnação (se parou de melhorar)
            if best_overall_fitness > last_best_fitness:
                last_best_fitness = best_overall_fitness
                stagnant_gens = 0
            else:
                stagnant_gens += 1
            
            # Envia a geração para a animação (Sempre envia o MELHOR GLOBAL, não a mutação falha)
            yield {
                "generation": gen + 1,
                "best_path": best_overall_path,
                "best_fitness": round(best_overall_fitness, 2),
                "found": found,
                "current": best_overall_path[-1],
                "visited": set(best_overall_path)
            }
            
            # Se já achou o destino e não conseguiu melhorar por 5 gerações, assume que chegou no ótimo
            if found and stagnant_gens >= 5:
                break
                
            # Seleção, Cruzamento e Mutação
            new_population = []
            
            # Elitismo: mantém os 2 melhores da geração anterior
            new_population.append(pop_fitness[0][1][:])
            new_population.append(pop_fitness[1][1][:])
            
            while len(new_population) < pop_size:
                # Torneio: pega pais do top 20
                parent1 = random.choice(pop_fitness[:20])[1]
                parent2 = random.choice(pop_fitness[:20])[1]
                
                # Crossover
                crossover_pt = random.randint(1, chromosome_length - 1)
                child1 = parent1[:crossover_pt] + parent2[crossover_pt:]
                child2 = parent2[:crossover_pt] + parent1[crossover_pt:]
                
                # Mutação (3%)
                for child in (child1, child2):
                    for i in range(chromosome_length):
                        if random.random() < 0.03:
                            child[i] = 1 - child[i]
                            
                new_population.extend([child1, child2])
                
            population = new_population[:pop_size]

    def genetic_search(self, start: str, target: str) -> dict:
        """Executa a busca genética e retorna o resultado final."""
        steps = list(self.genetic_search_steps(start, target))
        if not steps:
             return {"found": False, "visited": [], "path": []}
             
        last_step = steps[-1]
        return {
            "found": last_step["found"],
            "visited": last_step["best_path"],
            "path": last_step["best_path"] if last_step["found"] else [],
            "generations": len(steps)
        }

    def visualize(self, *,
                  method: str = "bfs",
                  start: str,
                  target: str,
                  interval: int = 600) -> None:
        """Anima Busca em Largura/Profundidade para encontrar cidade alvo com posicionamento geográfico."""

        if method not in {"bfs", "dfs"}:
            raise ValueError("method deve ser 'bfs' (Largura) ou 'dfs' (Profundidade)")

        G = nx.Graph()
        pos = {}
        
        # Calculate min/max for normalization
        lats = [lat for lat, lon in self.cities.values()]
        lons = [lon for lat, lon in self.cities.values()]
        lat_min, lat_max = min(lats), max(lats)
        lon_min, lon_max = min(lons), max(lons)
        
        # Normalize coordinates to fit nicely in plot (invert latitude for visual map orientation)
        for city, (lat, lon) in self.cities.items():
            G.add_node(city)
            # Normalize: lon to x-axis, lat to y-axis (inverted so north is up)
            x = (lon - lon_min) / (lon_max - lon_min) if lon_max != lon_min else 0.5
            y = (lat_max - lat) / (lat_max - lat_min) if lat_max != lat_min else 0.5  # Inverted
            pos[city] = (x, y)

        for city, neighbors in self.adj_list.items():
            for neighbor in neighbors:
                G.add_edge(city, neighbor)

        # Create larger, more professional figure
        fig, ax = plt.subplots(figsize=(16, 12), dpi=100)
        fig.patch.set_facecolor('#f8f9fa')
        ax.set_facecolor('#ffffff')
        
        # Title with method and cities
        method_display = "Busca em Largura" if method == "bfs" else "Busca em Profundidade"
        title = f"{method_display} - {start} → {target}"
        ax.set_title(title, fontsize=18, fontweight='bold', pad=20)
        
        # Add geographic context
        ax.set_xlabel('Longitude (West ← East)', fontsize=11)
        ax.set_ylabel('Latitude (South ← North)', fontsize=11)
        ax.grid(True, alpha=0.2, linestyle='--')

        # Base drawing - edges first
        nx.draw_networkx_edges(G, pos, ax=ax, edge_color="#d0d0d0", width=2, alpha=0.6)
        
        # Draw nodes
        node_collection = nx.draw_networkx_nodes(
            G,
            pos,
            ax=ax,
            node_color="#c5d9f1",
            node_size=1200,
            edgecolors="#1a1a1a",
            linewidths=2.5,
        )
        
        # Draw labels with better positioning
        labels = nx.draw_networkx_labels(G, pos, ax=ax, font_size=9, font_weight='bold')
        
        # Status text with better styling
        status_text = ax.text(0.02, 0.98, "", transform=ax.transAxes, 
                            verticalalignment='top', fontsize=13, fontweight='bold',
                            bbox=dict(boxstyle='round,pad=0.8', facecolor='#ffffcc', 
                                    edgecolor='#666666', linewidth=2))

        def update(frame: dict) -> None:
            visited = frame["visited"]
            current = frame["current"]
            found = frame["found"]

            node_colors = []
            for node in G.nodes():
                if node == current:
                    node_colors.append("#2ecc71")  # Bright green for current
                elif node in visited:
                    node_colors.append("#f39c12")  # Bright orange for visited
                else:
                    node_colors.append("#c5d9f1")  # Light blue for unvisited

            node_collection.set_color(node_colors)
            
            status = f"Visiting: {current}"
            if found:
                status += " [FOUND!]"
            status_text.set_text(status)

        steps = list(self.bfs_steps(start, target) if method == "bfs" else self.dfs_steps(start, target))
        if steps:
            anim = FuncAnimation(fig, update, frames=steps, interval=interval, repeat=False)
            plt.tight_layout()
            plt.show()
        else:
            print(f"City not found: {target}")


def load_cities_from_csv(filename: str) -> Graph:
    """Load cities from CSV file and create graph."""
    graph = Graph()
    
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            city = row['cidade']
            lat = float(row['latitude'])
            lon = float(row['longitude'])
            state = row.get('estado', '')  # Get state if available
            
            graph.add_city(city, lat, lon, state)
    
    graph.build_neighbors(max_distance=120)  # Connect cities within 120 km
    return graph


def main() -> None:
    graph = load_cities_from_csv("cidades_mt.csv")
    
    print("=" * 60)
    print("🗺️  BUSCA EM GRAFO - CIDADES DE MATO GROSSO")
    print("=" * 60)
    print("\nCidades disponíveis:")
    for city in sorted(graph.cities.keys()):
        print(f"  • {city}")
    
    while True:
        print("\n" + "-" * 60)
        start_city = input("\nDigite a cidade de ORIGEM (ou 'sair'): ").strip()
        if start_city.lower() == 'sair':
            break
        
        if start_city not in graph.cities:
            print(f"❌ Cidade '{start_city}' não encontrada!")
            continue
        
        target_city = input("Digite a cidade que quer BUSCAR: ").strip()
        if target_city not in graph.cities:
            print(f"❌ Cidade '{target_city}' não encontrada!")
            continue
        
        method = input("Método (1=Largura/2=Profundidade) [1]: ").strip() or "1"
        method_name = "bfs" if method == "1" else "dfs"
        
        # Test search
        result = graph.bfs(start_city, target_city) if method_name == "bfs" else graph.dfs(start_city, target_city)
        
        print(f"\n{'=' * 60}")
        method_display = "LARGURA" if method_name == "bfs" else "PROFUNDIDADE"
        print(f"Resultado da busca por {method_display}:")
        print(f"{'=' * 60}")
        
        if result["found"]:
            print(f"✓ Cidade '{target_city}' ENCONTRADA!")
            print(f"\nCaminho percorrido (ordem de visitação):")
            for i, city in enumerate(result["visited"], 1):
                print(f"  {i}. {city}")
            print(f"\nCaminho mais curto:")
            print(f"  {' → '.join(result['path'])}")
        else:
            print(f"✗ Cidade '{target_city}' NÃO foi encontrada!")
            print(f"\nCidades visitadas (em ordem):")
            for i, city in enumerate(result["visited"], 1):
                print(f"  {i}. {city}")
        
        animate = input("\nDeseja VER a animação da busca? (s/n) [s]: ").strip().lower() != 'n'
        if animate:
            graph.visualize(method=method_name, start=start_city, target=target_city, interval=800)


if __name__ == "__main__":
    main()
