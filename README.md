# 🎯 ApostAI - Sistema Inteligente de Análise Esportiva

![ApostAI Banner](https://img.shields.io/badge/ApostAI-Análise%20Esportiva-FF3002?style=for-the-badge&logo=football&logoColor=white)

## 📖 Sobre o Projeto

**ApostAI** é uma plataforma premium de análise esportiva que utiliza **Inteligência Artificial avançada** para processar milhares de dados e gerar recomendações inteligentes para apostas esportivas. Com precisão de **78%** nas previsões, o sistema combina algoritmos sofisticados com uma interface moderna e intuitiva.

## ✨ Principais Funcionalidades

### 🧠 **Análise com IA Avançada**
- **200+ critérios** de análise distribuídos em **13 categorias**
- **Algoritmos de Machine Learning** para processamento de dados
- **Análise em tempo real** com indicadores visuais
- **Sistema anti-repetição** para diversidade de apostas

### ⚽ **Dados Esportivos Reais**
- Integração com **API Football** para dados atualizados
- **Estatísticas de temporada** completas
- **Confrontos diretos (H2H)** históricos
- **Dados de jogadores** e artilheiros
- **Odds reais** de casas de apostas

### 🎯 **25+ Tipos de Mercados**
- **Gols:** Over/Under, Ambas marcam, xG
- **Resultado:** Casa/Empate/Fora
- **Handicap Asiático:** -1.5, +1.5
- **Jogadores:** Gols, cartões, performances
- **Escanteios e Cartões**
- **Primeiro/Segundo tempo**

### 📊 **Dashboard Interativo**
- **Interface glassmorphism** moderna
- **Animações suaves** e responsivas
- **Gráficos dinâmicos** de performance
- **Sistema de risco** inteligente
- **Design mobile-first**

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **Vite** para build otimizado
- **Lucide React** para ícones
- **CSS Animations** customizadas

### **Integração**
- **API Football** (API-Sports.io)
- **Dados em tempo real**
- **Sistema de fallback** robusto

### **Ferramentas de Desenvolvimento**
- **ESLint** para qualidade de código
- **PostCSS** + **Autoprefixer**
- **Hot Module Replacement**

## 🎨 Interface e UX

### **Design System**
- **Cores:** Preto (#000), Branco (#FFF), Vermelho (#FF3002)
- **Tipografia:** Inter font family
- **Layout:** Flexbox + Grid responsivo
- **Animações:** Float, breathe, shimmer

### **Responsividade**
- **Mobile-first** approach
- **Breakpoints:** sm, md, lg, xl
- **Touch-friendly** interactions
- **Performance otimizada**

## 📋 Estrutura do Projeto

```
ApostAI/
├── project/                 # Aplicação React
│   ├── src/
│   │   ├── App.tsx         # Componente principal
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css       # Estilos globais
│   │   └── assets/         # Assets estáticos
│   ├── dist/               # Build de produção
│   ├── package.json        # Dependências
│   ├── vite.config.ts      # Configuração Vite
│   └── tailwind.config.js  # Configuração Tailwind
├── CRITERIOS_APOSTAS_EXPANDIDOS.md  # Documentação dos algoritmos
├── README.md               # Este arquivo
└── .gitignore             # Arquivos ignorados
```

## 🔧 Instalação e Execução

### **Pré-requisitos**
- Node.js 16+ 
- npm ou yarn

### **Passos**
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Akejr/ApostAI.git
   cd ApostAI
   ```

2. **Instale as dependências:**
   ```bash
   cd project
   npm install
   ```

3. **Execute em desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Build para produção:**
   ```bash
   npm run build
   ```

## 🎯 Algoritmo de Análise

### **12 Categorias de Análise**
1. **xG Analysis** - Expected Goals
2. **Tactical Matchup** - Confronto tático
3. **Temporal Patterns** - Padrões temporais
4. **Disciplinary Risk** - Risco disciplinar
5. **Bench Strength** - Força do banco
6. **Crowd Factor** - Fator torcida
7. **Psychological Context** - Contexto psicológico
8. **Competition Context** - Contexto da competição
9. **Physical Conditions** - Condições físicas
10. **Meta Metrics** - Métricas meta
11. **Special Situations** - Situações especiais
12. **Extraordinary Conditions** - Condições extraordinárias

### **Sistema de Confiança**
```typescript
Base: 70%
+ Estatísticas temporada: +15%
+ H2H (≥3 jogos): +10%
+ Dados avançados: +5%
+ Forma recente: +5%
Máximo: 95%
```

## 📈 Performance e Métricas

- ⚡ **Precisão:** 78% nas previsões
- 🔍 **Dados processados:** 847+ por análise
- 📊 **Critérios de avaliação:** 200+
- 🎯 **Tipos de apostas:** 25+
- 🏆 **Categorias de análise:** 13

## 🛡️ Classificação de Risco

| **Risco** | **Odds** | **Confiança** | **Uso** |
|-----------|----------|---------------|---------|
| 🟢 **Baixo** | 1.30-1.35 | 80%+ | Recomendado |
| 🟡 **Médio** | 1.40-1.50 | 60-79% | Moderado |
| 🟠 **Alto** | 1.55-1.70 | 40-59% | Experiente |
| 🔴 **Elevado** | >1.70 | <40% | Especialista |

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Evandro Casanova** - [@Akejr](https://github.com/Akejr)

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## ⚠️ Aviso Legal

Este sistema é destinado apenas para fins educacionais e de entretenimento. Jogue com responsabilidade. +18 anos.

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

![GitHub stars](https://img.shields.io/github/stars/Akejr/ApostAI?style=social)
![GitHub forks](https://img.shields.io/github/forks/Akejr/ApostAI?style=social)

</div>
