# 🚀 GUIA DE EXECUÇÃO - SISTEMA DE BUSCA EM GRAFOS

## ✅ O que foi criado

### Backend (Python)
- ✓ `api.py` - API FastAPI com endpoints REST
- ✓ `algoritmo.py` - Implementação de BFS/DFS com dados reais
- ✓ `cidades_mt.csv` - Base de dados com 14 cidades de MT

### Frontend (React + Vite)
- ✓ Projeto completo em `frontend/`
- ✓ Componentes React prontos
- ✓ Visualização de grafo com Cytoscape.js
- ✓ Interface interativa com controles

---

## 📝 PASSO 1: Instalar Dependências do Frontend

Abra um **Command Prompt (cmd)** ou **PowerShell** como Administrador e execute:

```batch
cd "c:\WorkSpace\Engenharia de Computação\IA\frontend"
npm install
```

Isso vai instalar:
- React 18
- Vite
- Cytoscape.js
- Axios
- Outras dependências

⏱️ **Demora**: 2-5 minutos

---

## 🎯 PASSO 2: Iniciar o Backend

Abra um **novo Command Prompt** e execute:

```batch
cd "c:\WorkSpace\Engenharia de Computação\IA"
python api.py
```

Você verá:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

✅ **Backend pronto em**: http://127.0.0.1:8000

Documentação interativa: http://127.0.0.1:8000/docs

---

## 🎨 PASSO 3: Iniciar o Frontend

Abra um **terceiro Command Prompt** e execute:

```batch
cd "c:\WorkSpace\Engenharia de Computação\IA\frontend"
npm run dev
```

Você verá:
```
VITE v5.0.8  ready in xxx ms

 ➜  Local:   http://localhost:3000/
```

✅ **Frontend pronto em**: http://localhost:3000

---

## 🌐 PASSO 4: Usar a Aplicação

1. Abra o navegador em: **http://localhost:3000**
2. Você verá a interface com:
   - Panel de controles à esquerda
   - Grafo das cidades à direita
3. Selecione:
   - **Cidade de Origem** (ex: Cuiabá)
   - **Cidade de Destino** (ex: Sinop)
   - **Tipo de Busca** (Largura ou Profundidade)
4. Ajuste a **Velocidade da Animação** (100-2000ms)
5. Clique em **▶ Play** para iniciar

Veja a animação em tempo real com:
- 🟩 **Verde**: Nó sendo visitado
- 🟧 **Laranja**: Nós já visitados
- 🔵 **Azul claro**: Nós não visitados

---

## 🔗 Endpoints da API

### GET /cities
```bash
curl http://127.0.0.1:8000/cities
```

Retorna lista de cidades disponíveis.

### GET /graph
```bash
curl http://127.0.0.1:8000/graph
```

Retorna estrutura do grafo (nós e arestas).

### POST /search
```bash
curl -X POST http://127.0.0.1:8000/search \
  -H "Content-Type: application/json" \
  -d '{
    "start": "Cuiabá",
    "target": "Sinop",
    "method": "bfs"
  }'
```

Executa busca e retorna todos os passos para animação.

---

## 🧪 Exemplos de Busca

### Busca em Largura (BFS)
- **Origem**: Cuiabá
- **Destino**: Sinop
- **Resultado**: Encontra Sinop em 12 visitas
- **Caminho**: Cuiabá → Tangará da Serra → Lucas do Rio Verde → Sinop

### Busca em Profundidade (DFS)
- **Origem**: Cuiabá
- **Destino**: Cáceres
- **Resultado**: Encontra Cáceres em 14 visitas
- **Caminho**: Cuiabá → Várzea Grande → Rondonópolis → Jaciara → Tangará da Serra → Santo Antônio do Leverger → Nossa Senhora do Livramento → Poconé → Cáceres

---

## 🐛 Troubleshooting

### API não conecta
**Problema**: Erro ao conectar com http://127.0.0.1:8000

**Solução**:
1. Verifique se `python api.py` está rodando
2. Verifique se está na porta 8000
3. Tente abrir http://127.0.0.1:8000/docs no navegador

### npm install falha
**Problema**: Erro ao instalar dependências

**Solução**:
```batch
# Delete instalação anterior
cd frontend
rmdir /s /q node_modules
del package-lock.json

# Reinstale
npm install
```

### Grafo em branco no React
**Problema**: Grafo não aparece no navegador

**Solução**:
1. Abra o Console (F12)
2. Veja se há erros de conexão com API
3. Verifique se `python api.py` está rodando
4. Recarregue a página (F5)

### Porta já está em uso
**Problema**: Erro "Address already in use"

**Solução**:
```batch
# Mude a porta no vite.config.js
# Ou feche outros processos usando a porta
```

---

## 📚 Estrutura do Projeto

```
IA/
├── algoritmo.py                 # Classe Graph com BFS/DFS
├── api.py                       # FastAPI Server
├── cidades_mt.csv              # Dados das cidades
├── setup_check.py              # Verificador de setup
│
└── frontend/                    # Projeto React
    ├── package.json            # Dependências npm
    ├── vite.config.js          # Config Vite
    ├── index.html              # HTML principal
    │
    └── src/
        ├── main.jsx            # Entry point
        ├── index.css           # Estilos globais
        ├── App.jsx             # Componente principal
        ├── App.css             # Estilos do App
        ├── GraphVisualizer.jsx # Visualizador do grafo
        └── GraphVisualizer.css # Estilos do grafo
```

---

## ✨ Tecnologias Utilizadas

**Backend**:
- Python 3.10+
- FastAPI (API REST)
- Uvicorn (ASGI server)

**Frontend**:
- React 18
- Vite (build tool)
- Cytoscape.js (graph visualization)
- Axios (HTTP client)
- CSS3 (estilos)

**Dados**:
- 14 cidades principais de Mato Grosso
- Coordenadas geográficas reais
- Conexões por distância (até 300 km)

---

## 🎓 O que Você Está Aprendendo

1. **Algoritmos**: BFS e DFS em grafos
2. **Estruturas de Dados**: Listas de adjacência
3. **APIs REST**: Criação e consumo
4. **Frontend Web**: React com Vite
5. **Visualização**: Grafos de forma interativa
6. **Full Stack**: Backend + Frontend integrados

---

## 📞 Dúvidas?

Verifique:
1. Se o Backend está rodando (python api.py)
2. Se o Frontend instalar corretamente (npm install)
3. Se o navegador consegue acessar http://localhost:3000
4. Console do navegador (F12) para erros
5. Terminal do Python para mensagens de erro

---

**Pronto? Vamos começar! 🚀**
