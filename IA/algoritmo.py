from __future__ import annotations

import csv
import math
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
    
    graph.build_neighbors(max_distance=300)  # Connect cities within 300 km
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
