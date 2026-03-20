# 🗺️ Sistema Interativo de Busca em Grafos

<div align="center">

**Visualização em tempo real de algoritmos de busca (BFS e DFS) com dados geográficos reais de cidades de Mato Grosso**

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)](https://www.python.org)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Visão Geral

Este projeto é um **sistema educacional completo** que demonstra visualmente como funcionam os algoritmos de **Busca em Largura (BFS)** e **Busca em Profundidade (DFS)** em um grafo real. A aplicação oferece:

- 🟩 **Visualização interativa** do grafo com 14 cidades de MT
- ⚙️ **Dois algoritmos de busca** com animação em tempo real
- 🎮 **Interface intuitiva** com controles de zoom e velocidade
- 📊 **Dados geográficos reais** com cálculo de distância (Haversine)
- 🔄 **API REST completa** para requisições

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  React 18 + Vite + Cytoscape.js                    │
│  • Visualização interativa do grafo                │
│  • Controles de animação e zoom                    │
│  • Interface responsiva                            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP REST
                   │
┌──────────────────▼──────────────────────────────────┐
│                    Backend                          │
│  Python + FastAPI + Uvicorn                        │
│  • Endpoints REST para buscas                      │
│  • Processamento de algoritmos                     │
│  • Geração de passos de animação                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│                  Camada de Dados                    │
│  • algoritmo.py: Classe Graph com BFS/DFS         │
│  • cidades_mt.csv: Base de dados (14 cidades)     │
│  • Cálculo de distâncias geográficas               │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades Principais

### ✨ Visualização Interativa
- 📍 Posicionamento geográfico dos nós (latitude/longitude)
- 🎨 Cores dinâmicas durante a animação
- 🔍 Controles de zoom (50% - 300%)
- 🖱️ Scroll wheel + Ctrl para zoom suave
- 📏 Botões para zoom in/out/fit

### 🔍 Algoritmos de Busca
- **BFS (Busca em Largura)**: Explora por níveis, encontra caminho mais curto (nº de arestas)
- **DFS (Busca em Profundidade)**: Aprofunda em um ramo antes de voltar

#### Correções Implementadas
✅ **Erro de DFS corrigido**: Verificação de `parent` para evitar reescrita de caminho  
✅ **Layout otimizado**: Cose-Bilkent com espaçamento adequado

### 🎮 Controles da Aplicação
- Seleção de cidade de origem e destino
- Escolha entre BFS ou DFS
- Controle de velocidade da animação (100-2000ms)
- Exibição em tempo real de caminhos visitados

### 📊 Dados Reais
- 14 cidades principais de Mato Grosso
- Conexões automáticas por proximidade geográfica (até 300km)
- Coordenadas reais (latitude/longitude)
- Cálculo de distância com fórmula de Haversine

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Python** | 3.10+ | Linguagem principal |
| **FastAPI** | 0.100+ | Framework web REST |
| **Uvicorn** | 0.20+ | Servidor ASGI |
| **NetworkX** | 3.0+ | Análise de grafos |
| **Matplotlib** | 3.5+ | Visualização estática |

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **React** | 18+ | Framework UI |
| **Vite** | 5.0+ | Build tool |
| **Cytoscape.js** | 3.28+ | Visualização de grafos |
| **Axios** | 1.5+ | Cliente HTTP |

---

## 📋 Pré-requisitos

- **Python** 3.10 ou superior
- **Node.js** 18+ e **npm** 9+
- **Git** (opcional, para clonar o repositório)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

---

## 🚀 Como Executar

### Opção 1: Execução Automática (Recomendado)

```powershell
cd "c:\WorkSpace\Engenharia de Computação\IA"
.\start_all.bat
```

Isso inicia automaticamente:
- ✅ Backend na porta 8000
- ✅ Frontend na porta 3000

### Opção 2: Execução Manual

#### 1️⃣ Instalar Dependências Python

```bash
pip install fastapi uvicorn pydantic networkx matplotlib
```

#### 2️⃣ Iniciar Backend

```bash
cd IA
python api.py
```

**Saída esperada:**
```
INFO:     Started server process [xxxx]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

#### 3️⃣ Instalar Dependências Frontend (outro terminal)

```bash
cd frontend
npm install
```

#### 4️⃣ Iniciar Frontend

```bash
npm run dev
```

**Saída esperada:**
```
VITE v5.4.21  ready in xxxx ms
➜  Local:   http://localhost:3000/
```

### 5️⃣ Acessar a Aplicação

Abra no navegador: **http://localhost:3000** 🎉

---

## 📁 Estrutura do Projeto

```
IA/
├── 📄 README.md                           # Este arquivo
├── 📄 GUIA_EXECUCAO.md                    # Guia passo-a-passo
├── 📄 ARQUITETURA.md                      # Detalhes arquiteturais
├── 📄 PROJECT_STATUS.md                   # Status do projeto
│
├── 🔧 Backend Python
│   ├── algoritmo.py                       # Implementação do grafo e algoritmos
│   ├── api.py                             # API REST FastAPI
│   └── cidades_mt.csv                     # Base de dados (14 cidades)
│
├── 🎨 Frontend React
│   ├── src/
│   │   ├── App.jsx                        # Componente principal
│   │   ├── App.css                        # Estilos do aplicativo
│   │   ├── GraphVisualizer.jsx            # Componente do grafo
│   │   ├── GraphVisualizer.css            # Estilos do grafo
│   │   ├── main.jsx                       # Entry point
│   │   └── index.css                      # Estilos globais
│   ├── index.html                         # HTML raiz
│   ├── vite.config.js                     # Configuração Vite
│   ├── package.json                       # Dependências npm
│   └── package-lock.json
│
└── 🚀 Scripts
    ├── start_all.bat                      # Executa tudo de uma vez
    ├── install_frontend.bat                # Instala dependências frontend
    └── setup_check.py                      # Verifica configuração
```

---

## 💻 Como Usar a Aplicação

### Interface Principal

```
┌───────────────────────────────────────────────────────────┐
│  Painel de Controle              │    Visualizador Grafo  │
│  ✓ Origem                        │    [Grafo das cidades] │
│  ✓ Destino                       │    🔍+ 🔍- ↔️ 100%    │
│  ✓ Algoritmo (BFS/DFS)          │                        │
│  ✓ Velocidade                    │                        │
│  ▶ Play                          │                        │
│  ⏸ Pause (durante animação)      │                        │
│  ⏹ Reset                         │                        │
└───────────────────────────────────────────────────────────┘
```

### Passo a Passo de Uso

1. **Selecione a Cidade de Origem**
   - Clique no dropdown e escolha uma cidade (ex: Cuiabá)

2. **Selecione a Cidade de Destino**
   - Escolha outra cidade (ex: Sinop)

3. **Escolha o Algoritmo**
   - BFS: Busca em largura (nível por nível)
   - DFS: Busca em profundidade (aprofunda no ramo)

4. **Ajuste a Velocidade** (opcional)
   - Slider de 100ms a 2000ms entre passos

5. **Clique em ▶ Play**
   - Observe a animação em cores:
     - 🟩 **Verde**: Nó sendo visitado
     - 🟧 **Laranja**: Nós já visitados
     - 🔵 **Azul**: Nós não visitados

6. **Controle de Zoom**
   - **Ctrl + Scroll**: Zoom suave
   - **🔍+/🔍-**: Botões de zoom
   - **↔️**: Ajustar vista completa

---

## 🔗 API REST - Endpoints

### 1. GET `/health`
Verificar saúde da API.

**Resposta:**
```json
{ "status": "ok" }
```

### 2. GET `/cities`
Lista todas as cidades disponíveis.

**Resposta:**
```json
{
  "cities": ["Cuiabá", "Várzea Grande", "Rondonópolis", ...],
  "count": 14
}
```

### 3. GET `/graph`
Retorna a estrutura completa do grafo.

**Resposta:**
```json
{
  "nodes": [
    { "id": "Cuiabá", "label": "Cuiabá", "lat": -15.5945, "lon": -56.0949 },
    ...
  ],
  "edges": [
    { "source": "Cuiabá", "target": "Várzea Grande" },
    ...
  ]
}
```

### 4. POST `/search`
Executa busca BFS ou DFS.

**Requisição:**
```json
{
  "start": "Cuiabá",
  "target": "Sinop",
  "method": "bfs"
}
```

**Resposta:**
```json
{
  "found": true,
  "visited": ["Cuiabá", "Várzea Grande", "Jaciara", ...],
  "path": ["Cuiabá", "Lucas do Rio Verde", "Sinop"],
  "steps": [
    { "current": "Cuiabá", "visited": ["Cuiabá"], "found": false },
    { "current": "Várzea Grande", "visited": ["Cuiabá", "Várzea Grande"], "found": false },
    ...
  ]
}
```

**Ver documentação interativa:** http://127.0.0.1:8000/docs

---

## 🧮 Algoritmos Explicados

### BFS (Busca em Largura)
```
Funcionamento:
1. Inicia pela cidade de origem
2. Explora TODOS os vizinhos (nível 1)
3. Depois explora vizinhos dos vizinhos (nível 2)
4. Continua expandindo por níveis

Características:
✅ Encontra o caminho com MENOS ARESTAS
✅ Mais lento em grafos grandes (explora tudo)
✅ Garante encontrar solução se existir
✅ Ordem: FIFO (First In First Out) - Queue

Aplicações:
• Encontrar vizinhos imediatos
• Análise de redes sociais
• GPS: menor número de etapas
```

### DFS (Busca em Profundidade)
```
Funcionamento:
1. Inicia pela cidade de origem
2. Aprofunda em UM ramo o máximo possível
3. Ao atingir um "beco sem saída", volta
4. Tenta outro ramo

Características:
✅ Mais rápida em alguns casos
✅ Usa menos memória que BFS
❌ Pode encontrar um caminho mais longo
✅ Garante encontrar solução se existir
✅ Ordem: LIFO (Last In First Out) - Stack

Aplicações:
• Detecção de ciclos
• Labirinto (backtracking)
• Análise de conectividade
```

### Comparação BFS vs DFS

| Aspecto | BFS | DFS |
|--------|-----|-----|
| **Estrutura** | Queue (FIFO) | Stack (LIFO) |
| **Caminho** | Mais curto (arestas) | Pode ser mais longo |
| **Memória** | Mais (explora níveis) | Menos (explora ramos) |
| **Velocidade** | Mais lenta | Mais rápida |
| **Garantia** | Encontra se existir | Encontra se existir |
| **Melhor para** | Caminho mais curto | Exploração profunda |

---

## 🐛 Correções Implementadas

### Erro de Lógica em DFS Corrigido
**Problema Original:**
```python
# ❌ ERRADO: Reescreve parent mesmo se já visitado
for neighbor in reversed(self.adj_list.get(node, [])):
    if neighbor not in visited:
        parent[neighbor] = node  # Pode reescrever!
        stack.append(neighbor)
```

**Solução Implementada:**
```python
# ✅ CORRETO: Verifica se parent já foi definido
for neighbor in reversed(self.adj_list.get(node, [])):
    if neighbor not in visited and neighbor not in parent:
        parent[neighbor] = node  # Define apenas uma vez
        stack.append(neighbor)
```

**Impacto:** Garante que o caminho reconstruído sempre será correto e consistente.

---

## 🎨 Controle de Layout

O grafo usa o algoritmo **Cose-Bilkent** (force-directed layout) com configurações otimizadas:

| Parâmetro | Valor | Efeito |
|-----------|-------|--------|
| `nodeSpacing` | 80 | Espaçamento entre nós |
| `spacingFactor` | 2.5 | Fator de compactação |
| `nodeSeparation` | 150 | Separação mínima |
| `avoidOverlap` | true | Evita sobreposição |
| `gravity` | 0.5 | Atração central |

**Resultado:** Nós bem distribuídos, sem sobreposição, mas próximos o suficiente.

---

## 📊 Dados das Cidades

O arquivo `cidades_mt.csv` contém:

```
cidade,latitude,longitude,consumo_mwh,populacao
Cuiabá,-15.5945,-56.0949,850.5,612000
Várzea Grande,-15.6499,-56.1386,520.3,285000
Rondonópolis,-16.4674,-54.6345,680.2,241000
Sinop,-11.8551,-55.4934,450.1,142000
...
```

**Conexões:** Cidades dentro de 300km são conectadas automaticamente.

---

## 🔧 Troubleshooting

### Port 8000/3000 já em uso?
```bash
# Matar processo
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Problema com npm?
```bash
# Limpar cache
npm cache clean --force
npm install
```

### Backend não conecta?
```bash
# Verificar se está rodando
curl http://127.0.0.1:8000/health
```

### Grafo não carrega?
```
✓ Recarregue a página (F5)
✓ Limpe o cache (Ctrl+Shift+Del)
✓ Verifique console (F12) para erros
```

---

## 📚 Referências

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [Cytoscape.js Documentation](https://js.cytoscape.org)
- [Algoritmos de Busca](https://en.wikipedia.org/wiki/Graph_traversal)
  "count": 14
}
```

### GET /graph
Retorna estrutura completa do grafo.

```json
{
  "nodes": [
    {"id": "Cuiabá", "label": "Cuiabá", "lat": -15.5945, "lon": -56.0949},
    ...
  ],
  "edges": [
    {"source": "Cuiabá", "target": "Várzea Grande"},
    ...
  ]
}
```

### POST /search
Executa uma busca BFS/DFS.

**Request:**
```json
{
  "start": "Cuiabá",
  "target": "Sinop",
  "method": "bfs"
}
```

**Response:**
```json
{
  "found": true,
  "visited": ["Cuiabá", "Várzea Grande", ...],
  "path": ["Cuiabá", "Tangará da Serra", "Lucas do Rio Verde", "Sinop"],
  "steps": [
    {"current": "Cuiabá", "visited": ["Cuiabá"], "found": false},
    {"current": "Várzea Grande", "visited": ["Cuiabá", "Várzea Grande"], "found": false},
    ...
  ]
}
```

## 📊 Exemplo de Uso

1. **Abra o navegador** em http://localhost:3000
2. **Selecione a cidade de origem** (ex: Cuiabá)
3. **Selecione a cidade de destino** (ex: Sinop)
4. **Escolha o tipo de busca** (Largura ou Profundidade)
5. **Clique em "Play"** para iniciar a animação
6. Observe o grafo com nós mudando de cor conforme o algoritmo executa

## 🎯 Casos de Teste

| Busca | Origem | Destino | Cidades Visitadas | Caminho Mais Curto |
|-------|--------|---------|-------------------|--------------------|
| BFS | Cuiabá | Sinop | 12 | Cuiabá → Tangará da Serra → Lucas do Rio Verde → Sinop |
| DFS | Cuiabá | Cáceres | 14 | Cuiabá → Várzea Grande → Rondonópolis → ... → Cáceres |

## 🛠️ Troubleshooting

### API não conecta
- Verifique se o servidor Python está rodando: `http://127.0.0.1:8000`
- Verifique CORS na API (já configurado)

### Grafo não aparece
- Verifique o console do navegador (F12)
- Certifique-se que `cidades_mt.csv` está no mesmo diretório que `api.py`

### npm install falhando
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

## 📚 Tecnologias Utilizadas

- **FastAPI**: Framework Python para APIs
- **Uvicorn**: Servidor ASGI
- **React 18**: UI library
- **Vite**: Build tool
- **Cytoscape.js**: Visualização de grafos
- **Axios**: Cliente HTTP
- **CSS3**: Estilos

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais.

## 🤝 Contribuições

Para melhorias ou sugestões, abra uma issue ou pull request!

---

**Desenvolvido com ❤️ para aprender sobre Estruturas de Dados e Algoritmos**
