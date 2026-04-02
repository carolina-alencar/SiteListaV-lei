# 🏐 Sistema de Lista para Jogos de Vôlei

Sistema web para gerenciamento de listas de jogadores para partidas de vôlei, com controle de horário de inscrição e painel administrativo.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📖 Sobre

Sistema completo para organizar partidas de vôlei. Os jogadores se inscrevem preenchendo seu nome a partir das **08:00 da manhã**. Os **28 primeiros** ficam na lista de confirmados, os demais entram na **lista de espera**. Caso alguém desista, é movido para a **lista de desistências** e o próximo da espera é promovido automaticamente.

Todas as ações de gerenciamento (desistência, remoção, sorteio de times, etc.) são exclusivas para **administradores**.

---

## ✨ Funcionalidades

### Para todos os usuários
- ✅ Inscrição na lista a partir das **08:00**
- ✅ Visualização das listas (confirmados, espera e desistências)
- ✅ Visualização de estatísticas em tempo real
- ✅ Contagem regressiva para abertura das inscrições
- ✅ Relógio em tempo real

### Para administradores
- 🔒 Mover jogadores para lista de desistências
- 🔒 Retornar jogadores da desistência para a lista
- 🔒 Remover jogadores permanentemente
- 🔒 Sortear **4 times de 7 jogadores**
- 🔒 Forçar abertura ou fechamento das inscrições
- 🔒 Exportar lista completa (copia para a área de transferência)
- 🔒 Alterar senha de administrador
- 🔒 Limpar todas as listas

---

## 📋 Regras do Sistema

| Ação | Permissão | Condição |
|---|---|---|
| Inscrever nome | Qualquer pessoa | A partir das 08:00 |
| Ver listas e estatísticas | Qualquer pessoa | Sempre |
| Mover para desistência | Administrador | Sempre |
| Retornar da desistência | Administrador | Sempre |
| Remover jogador | Administrador | Sempre |
| Sortear times | Administrador | Com 28 confirmados |
| Forçar abrir/fechar inscrições | Administrador | Sempre |
| Exportar lista | Administrador | Sempre |
| Alterar senha | Administrador | Sempre |
| Limpar tudo | Administrador | Sempre |

---

## 🔧 Como Usar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/volei-lista.git
```

### 2. Acesse a pasta do projeto

```bash
cd volei-lista
```

### 3. Abra no navegador

Basta abrir o arquivo `index.html` diretamente no navegador. **Não é necessário servidor.**

```bash
# No Linux/Mac
open index.html

# No Windows
start index.html
```

---

## 🔐 Acesso de Administrador

| Campo | Valor |
|---|---|
| **Senha padrão** | `admin123` |

> ⚠️ **Recomendado:** altere a senha padrão no primeiro acesso através do painel do administrador.

Para acessar o painel:

1. Clique em **"Área do Administrador"**
2. Digite a senha
3. Clique em **"Entrar"**

---

## 📁 Estrutura do Projeto

```
volei-lista/
├── index.html    # Estrutura da página
├── style.css     # Estilos e responsividade
├── script.js     # Lógica do sistema
└── README.md     # Documentação
```

---

## ⏰ Controle de Horário

- **Antes das 08:00** → Formulário bloqueado com contagem regressiva
- **A partir das 08:00** → Inscrições liberadas automaticamente
- **Administrador** pode forçar abertura ou fechamento a qualquer momento

---

## 🏗️ Fluxo do Sistema

```
Jogador preenche o nome
         │
         ▼
   Vagas disponíveis? ──── Sim ──── Lista de Confirmados (máx. 28)
         │
        Não
         │
         ▼
   Lista de Espera
         │
         ▼
   Alguém desistiu? ──── Sim ──── 1º da espera é promovido automaticamente
         │
        Não
         │
         ▼
   Aguarda vaga
```

---

## 💾 Persistência de Dados

Os dados são armazenados no **LocalStorage** do navegador:

- Listas de jogadores (confirmados, espera, desistências)
- Senha do administrador
- Estado de abertura/fechamento forçado

> ⚠️ Limpar os dados do navegador apagará todas as informações.

---

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:

- 🖥️ Desktop
- 📱 Tablet
- 📱 Celular

---

## 🛠️ Tecnologias

- **HTML5** — Estrutura
- **CSS3** — Estilização, animações e responsividade
- **JavaScript (ES6+)** — Lógica, persistência e manipulação do DOM
- **Font Awesome** — Ícones
- **Google Fonts (Poppins)** — Tipografia

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar, modificar e distribuir.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir **issues** ou enviar **pull requests**.

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request
