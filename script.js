// ===== SISTEMA DE LISTA DE VÔLEI COM ADMIN E CONTROLE DE HORÁRIO =====

class VoleiListaSystem {
    constructor() {
        // Configurações
        this.MAX_JOGADORES = 28;
        this.JOGADORES_POR_TIME = 7;
        this.NUM_TIMES = 4;
        this.HORA_ABERTURA = 8; // 8:00 da manhã
        this.SENHA_PADRAO = 'admin123'; // Senha padrão inicial

        // Estados
        this.confirmados = [];
        this.espera = [];
        this.desistencias = [];
        this.isAdmin = false;
        this.forcadoAberto = false;
        this.forcadoFechado = false;
        this.senhaAdmin = this.SENHA_PADRAO;

        // Modal
        this.modalCallback = null;

        // Elementos do DOM
        this.cacheDom();

        // Inicializar
        this.init();
    }

    cacheDom() {
        // Form
        this.form = document.getElementById('formInscricao');
        this.inputNome = document.getElementById('nomeJogador');
        this.mensagem = document.getElementById('mensagem');
        this.formSection = document.getElementById('formSection');

        // Listas
        this.listaConfirmados = document.getElementById('listaConfirmados');
        this.listaEspera = document.getElementById('listaEspera');
        this.listaDesistencias = document.getElementById('listaDesistencias');

        // Stats
        this.elTotalConfirmados = document.getElementById('totalConfirmados');
        this.elTotalEspera = document.getElementById('totalEspera');
        this.elTotalDesistencias = document.getElementById('totalDesistencias');
        this.elBadgeConfirmados = document.getElementById('badgeConfirmados');
        this.elBadgeEspera = document.getElementById('badgeEspera');
        this.elBadgeDesistencias = document.getElementById('badgeDesistencias');
        this.elBarraConfirmados = document.getElementById('barraConfirmados');

        // Status horário
        this.elStatusHorario = document.getElementById('statusHorario');
        this.elHoraAtual = document.getElementById('horaAtual');

        // Countdown
        this.elCountdownSection = document.getElementById('countdownSection');
        this.elCountHoras = document.getElementById('countHoras');
        this.elCountMinutos = document.getElementById('countMinutos');
        this.elCountSegundos = document.getElementById('countSegundos');

        // Times
        this.elTeamsSection = document.getElementById('teamsSection');
        this.elTeamsGrid = document.getElementById('teamsGrid');

        // Admin
        this.elAdminLoginSection = document.getElementById('adminLoginSection');
        this.btnAdminToggle = document.getElementById('btnAdminToggle');
        this.elAdminToggleText = document.getElementById('adminToggleText');
        this.elAdminLoginForm = document.getElementById('adminLoginForm');
        this.inputSenhaAdmin = document.getElementById('senhaAdmin');
        this.btnLogin = document.getElementById('btnLogin');
        this.mensagemAdmin = document.getElementById('mensagemAdmin');
        this.elAdminLogado = document.getElementById('adminLogado');
        this.btnLogout = document.getElementById('btnLogout');
        this.elAdminPanel = document.getElementById('adminPanel');

        // Admin actions
        this.btnAdminForcarAbrir = document.getElementById('btnAdminForcarAbrir');
        this.btnAdminForcarFechar = document.getElementById('btnAdminForcarFechar');
        this.btnAdminSortear = document.getElementById('btnAdminSortear');
        this.btnAdminExportar = document.getElementById('btnAdminExportar');
        this.btnAdminConfig = document.getElementById('btnAdminConfig');
        this.btnAdminResetar = document.getElementById('btnAdminResetar');

        // Modal
        this.elModalOverlay = document.getElementById('modalOverlay');
        this.elModalTitulo = document.getElementById('modalTitulo');
        this.elModalMensagem = document.getElementById('modalMensagem');
        this.elModalIcone = document.getElementById('modalIcone');
        this.elModalInputContainer = document.getElementById('modalInputContainer');
        this.elModalInput = document.getElementById('modalInput');
        this.elModalInput2 = document.getElementById('modalInput2');
        this.btnModalConfirmar = document.getElementById('btnModalConfirmar');
        this.btnModalCancelar = document.getElementById('btnModalCancelar');
    }

    init() {
        this.carregarDados();
        this.criarParticulas();
        this.criarToastContainer();
        this.bindEvents();
        this.iniciarRelogio();
        this.renderAll();
        this.atualizarStatusHorario();
    }

    // ==========================================
    //  PERSISTÊNCIA
    // ==========================================
    salvarDados() {
        const dados = {
            confirmados: this.confirmados,
            espera: this.espera,
            desistencias: this.desistencias,
            senhaAdmin: this.senhaAdmin,
            forcadoAberto: this.forcadoAberto,
            forcadoFechado: this.forcadoFechado
        };
        localStorage.setItem('voleiLista', JSON.stringify(dados));
    }

    carregarDados() {
        const dados = localStorage.getItem('voleiLista');
        if (dados) {
            const parsed = JSON.parse(dados);
            this.confirmados = parsed.confirmados || [];
            this.espera = parsed.espera || [];
            this.desistencias = parsed.desistencias || [];
            this.senhaAdmin = parsed.senhaAdmin || this.SENHA_PADRAO;
            this.forcadoAberto = parsed.forcadoAberto || false;
            this.forcadoFechado = parsed.forcadoFechado || false;
        }
    }

    // ==========================================
    //  CONTROLE DE HORÁRIO
    // ==========================================
    inscricoesAbertas() {
        // Admin pode forçar
        if (this.forcadoAberto) return true;
        if (this.forcadoFechado) return false;

        const agora = new Date();
        return agora.getHours() >= this.HORA_ABERTURA;
    }

    iniciarRelogio() {
        this.atualizarRelogio();
        setInterval(() => {
            this.atualizarRelogio();
            this.atualizarStatusHorario();
            this.atualizarCountdown();
        }, 1000);
    }

    atualizarRelogio() {
        const agora = new Date();
        this.elHoraAtual.textContent = agora.toLocaleTimeString('pt-BR');
    }

    atualizarStatusHorario() {
        const aberto = this.inscricoesAbertas();
        const statusIcon = this.elStatusHorario.querySelector('.status-icon i');
        const statusText = this.elStatusHorario.querySelector('.status-text');
        const statusDetail = this.elStatusHorario.querySelector('.status-detail');
        const formCard = document.querySelector('.form-card');

        if (aberto) {
            this.elStatusHorario.className = 'status-horario aberto';
            statusIcon.className = 'fas fa-lock-open';
            statusText.textContent = 'Inscrições abertas';

            if (this.forcadoAberto) {
                statusDetail.textContent = 'Aberto pelo administrador';
            } else {
                statusDetail.textContent = 'Inscreva-se agora!';
            }

            formCard.classList.remove('locked');
            this.elCountdownSection.style.display = 'none';
        } else {
            this.elStatusHorario.className = 'status-horario fechado';
            statusIcon.className = 'fas fa-lock';
            statusText.textContent = 'Inscrições fechadas';

            if (this.forcadoFechado) {
                statusDetail.textContent = 'Fechado pelo administrador';
            } else {
                statusDetail.textContent = 'Abrem às 08:00';
            }

            formCard.classList.add('locked');

            // Mostrar countdown se não forçado fechado (se forçado, é decisão admin)
            if (!this.forcadoFechado) {
                this.elCountdownSection.style.display = 'block';
            } else {
                this.elCountdownSection.style.display = 'none';
            }
        }
    }

    atualizarCountdown() {
        if (this.inscricoesAbertas()) return;

        const agora = new Date();
        let alvo = new Date();
        alvo.setHours(this.HORA_ABERTURA, 0, 0, 0);

        // Se já passou das 8h hoje, alvo é amanhã
        if (agora >= alvo) {
            alvo.setDate(alvo.getDate() + 1);
        }

        const diff = alvo - agora;
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);

        this.elCountHoras.textContent = String(horas).padStart(2, '0');
        this.elCountMinutos.textContent = String(minutos).padStart(2, '0');
        this.elCountSegundos.textContent = String(segundos).padStart(2, '0');
    }

    // ==========================================
    //  PARTÍCULAS & TOAST
    // ==========================================
    criarParticulas() {
        const container = document.getElementById('particles');
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 15 + 10) + 's';
            p.style.animationDelay = Math.random() * 15 + 's';
            p.style.width = (Math.random() * 4 + 2) + 'px';
            p.style.height = p.style.width;
            container.appendChild(p);
        }
    }

    criarToastContainer() {
        const c = document.createElement('div');
        c.className = 'toast-container';
        c.id = 'toastContainer';
        document.body.appendChild(c);
    }

    showToast(texto, tipo) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        const icones = { sucesso: 'check-circle', erro: 'times-circle', info: 'info-circle' };
        toast.innerHTML = `<i class="fas fa-${icones[tipo]}"></i> ${texto}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    mostrarMensagem(el, texto, tipo) {
        el.textContent = texto;
        el.className = `mensagem ${tipo} show`;
        setTimeout(() => { el.className = 'mensagem'; }, 4000);
    }

    // ==========================================
    //  EVENTOS
    // ==========================================
    bindEvents() {
        // Inscrição
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.inscreverJogador();
        });

        // Admin toggle
        this.btnAdminToggle.addEventListener('click', () => {
            if (this.isAdmin) return;
            const form = this.elAdminLoginForm;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        // Admin login
        this.btnLogin.addEventListener('click', () => this.loginAdmin());
        this.inputSenhaAdmin.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.loginAdmin();
        });

        // Admin logout
        this.btnLogout.addEventListener('click', () => this.logoutAdmin());

        // Admin actions
        this.btnAdminForcarAbrir.addEventListener('click', () => {
            this.forcadoAberto = true;
            this.forcadoFechado = false;
            this.salvarDados();
            this.atualizarStatusHorario();
            this.showToast('Inscrições abertas manualmente!', 'sucesso');
        });

        this.btnAdminForcarFechar.addEventListener('click', () => {
            this.forcadoFechado = true;
            this.forcadoAberto = false;
            this.salvarDados();
            this.atualizarStatusHorario();
            this.showToast('Inscrições fechadas manualmente!', 'info');
        });

        this.btnAdminSortear.addEventListener('click', () => this.sortearTimes());
        this.btnAdminExportar.addEventListener('click', () => this.exportarLista());

        this.btnAdminConfig.addEventListener('click', () => {
            this.abrirModalComInput(
                'Alterar Senha de Administrador',
                'Digite a nova senha:',
                'Nova senha',
                'Confirme a nova senha',
                true,
                (novaSenha, confirmacao) => {
                    if (novaSenha.length < 4) {
                        this.showToast('A senha deve ter pelo menos 4 caracteres!', 'erro');
                        return;
                    }
                    if (novaSenha !== confirmacao) {
                        this.showToast('As senhas não coincidem!', 'erro');
                        return;
                    }
                    this.senhaAdmin = novaSenha;
                    this.salvarDados();
                    this.showToast('Senha alterada com sucesso!', 'sucesso');
                }
            );
        });

        this.btnAdminResetar.addEventListener('click', () => {
            this.abrirModal(
                'Limpar Todas as Listas',
                'Tem certeza que deseja remover TODOS os jogadores? Esta ação não pode ser desfeita!',
                () => this.resetarTudo()
            );
        });

        // Modal
        this.btnModalCancelar.addEventListener('click', () => this.fecharModal());
        this.btnModalConfirmar.addEventListener('click', () => {
            if (this.modalCallback) {
                const inputVisible = this.elModalInputContainer.style.display !== 'none';
                if (inputVisible) {
                    this.modalCallback(this.elModalInput.value, this.elModalInput2.value);
                } else {
                    this.modalCallback();
                }
            }
            this.fecharModal();
        });
        this.elModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elModalOverlay) this.fecharModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.fecharModal();
        });
    }

    // ==========================================
    //  ADMIN
    // ==========================================
    loginAdmin() {
        const senha = this.inputSenhaAdmin.value;

        if (senha === this.senhaAdmin) {
            this.isAdmin = true;
            this.inputSenhaAdmin.value = '';
            this.elAdminLoginForm.style.display = 'none';
            this.elAdminLogado.style.display = 'flex';
            this.btnAdminToggle.style.display = 'none';
            this.elAdminPanel.style.display = 'block';
            this.showToast('Login de administrador realizado! 🔓', 'sucesso');
            this.renderAll();
        } else {
            this.mostrarMensagem(this.mensagemAdmin, 'Senha incorreta!', 'erro');
            this.inputSenhaAdmin.value = '';
            this.inputSenhaAdmin.focus();
        }
    }

    logoutAdmin() {
        this.isAdmin = false;
        this.elAdminLogado.style.display = 'none';
        this.btnAdminToggle.style.display = 'inline-flex';
        this.elAdminPanel.style.display = 'none';
        this.showToast('Saiu do modo administrador', 'info');
        this.renderAll();
    }

    // ==========================================
    //  INSCRIÇÃO
    // ==========================================
    inscreverJogador() {
        // Verificar horário
        if (!this.inscricoesAbertas()) {
            this.mostrarMensagem(
                this.mensagem,
                '🔒 Inscrições fechadas! Volte a partir das 08:00.',
                'erro'
            );
            return;
        }

        const nome = this.inputNome.value.trim();

        if (!nome) {
            this.mostrarMensagem(this.mensagem, 'Por favor, digite seu nome.', 'erro');
            return;
        }

        if (nome.length < 2) {
            this.mostrarMensagem(this.mensagem, 'O nome deve ter pelo menos 2 caracteres.', 'erro');
            return;
        }

        // Duplicado
        const nomeNorm = nome.toLowerCase();
        const dup = [...this.confirmados, ...this.espera].find(
            j => j.nome.toLowerCase() === nomeNorm
        );

        if (dup) {
            this.mostrarMensagem(this.mensagem, 'Este nome já está na lista!', 'erro');
            return;
        }

        // Verificar desistente
        const desistente = this.desistencias.find(
            j => j.nome.toLowerCase() === nomeNorm
        );

        if (desistente) {
            this.mostrarMensagem(
                this.mensagem,
                'Você já desistiu anteriormente. Peça a um administrador para recolocá-lo.',
                'info'
            );
            return;
        }

        // Criar jogador
        const jogador = {
            id: this.gerarId(),
            nome: this.capitalizarNome(nome),
            horario: this.getHorarioAtual(),
            timestamp: Date.now()
        };

        if (this.confirmados.length < this.MAX_JOGADORES) {
            this.confirmados.push(jogador);
            this.mostrarMensagem(
                this.mensagem,
                `✅ ${jogador.nome} confirmado(a)! Posição #${this.confirmados.length}`,
                'sucesso'
            );
            this.showToast(`${jogador.nome} confirmado(a)! 🏐`, 'sucesso');
        } else {
            this.espera.push(jogador);
            this.mostrarMensagem(
                this.mensagem,
                `⏳ Lista cheia! ${jogador.nome} na lista de espera. Posição: #${this.espera.length}`,
                'info'
            );
            this.showToast(`${jogador.nome} na lista de espera`, 'info');
        }

        this.inputNome.value = '';
        this.inputNome.focus();
        this.salvarDados();
        this.renderAll();
    }

    // ==========================================
    //  AÇÕES ADMIN (desistir, retornar, remover)
    // ==========================================
    desistirJogador(id) {
        if (!this.isAdmin) {
            this.showToast('Apenas administradores podem fazer isso!', 'erro');
            return;
        }

        let index = this.confirmados.findIndex(j => j.id === id);
        let jogador = null;
        let eraConfirmado = false;

        if (index !== -1) {
            jogador = this.confirmados.splice(index, 1)[0];
            eraConfirmado = true;
        } else {
            index = this.espera.findIndex(j => j.id === id);
            if (index !== -1) {
                jogador = this.espera.splice(index, 1)[0];
            }
        }

        if (jogador) {
            jogador.horarioDesistencia = this.getHorarioAtual();
            this.desistencias.push(jogador);

            // Promover da espera
            if (eraConfirmado && this.espera.length > 0) {
                const promovido = this.espera.shift();
                this.confirmados.push(promovido);
                this.showToast(`${promovido.nome} promovido(a) da lista de espera! 🎉`, 'sucesso');
            }

            this.showToast(`${jogador.nome} movido para desistências`, 'info');
            this.salvarDados();
            this.renderAll();
        }
    }

    retornarJogador(id) {
        if (!this.isAdmin) {
            this.showToast('Apenas administradores podem fazer isso!', 'erro');
            return;
        }

        const index = this.desistencias.findIndex(j => j.id === id);
        if (index !== -1) {
            const jogador = this.desistencias.splice(index, 1)[0];
            delete jogador.horarioDesistencia;
            jogador.horario = this.getHorarioAtual();
            jogador.timestamp = Date.now();

            if (this.confirmados.length < this.MAX_JOGADORES) {
                this.confirmados.push(jogador);
                this.showToast(`${jogador.nome} retornou e foi confirmado(a)! 🎉`, 'sucesso');
            } else {
                this.espera.push(jogador);
                this.showToast(`${jogador.nome} retornou para a lista de espera`, 'info');
            }

            this.salvarDados();
            this.renderAll();
        }
    }

    removerJogador(id, lista) {
        if (!this.isAdmin) {
            this.showToast('Apenas administradores podem fazer isso!', 'erro');
            return;
        }

        let arr;
        switch (lista) {
            case 'confirmados': arr = this.confirmados; break;
            case 'espera': arr = this.espera; break;
            case 'desistencias': arr = this.desistencias; break;
        }

        const index = arr.findIndex(j => j.id === id);
        if (index !== -1) {
            const jogador = arr.splice(index, 1)[0];

            if (lista === 'confirmados' && this.espera.length > 0) {
                const promovido = this.espera.shift();
                this.confirmados.push(promovido);
                this.showToast(`${promovido.nome} promovido(a) da espera!`, 'sucesso');
            }

            this.showToast(`${jogador.nome} removido(a) permanentemente`, 'info');
            this.salvarDados();
            this.renderAll();
        }
    }

    // ==========================================
    //  SORTEAR TIMES (admin)
    // ==========================================
    sortearTimes() {
        if (!this.isAdmin) {
            this.showToast('Apenas administradores podem sortear times!', 'erro');
            return;
        }

        if (this.confirmados.length < this.MAX_JOGADORES) {
            this.showToast(
                `Precisa de ${this.MAX_JOGADORES} jogadores. Faltam ${this.MAX_JOGADORES - this.confirmados.length}.`,
                'erro'
            );
            return;
        }

        const jogadores = [...this.confirmados];
        // Fisher-Yates shuffle
        for (let i = jogadores.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [jogadores[i], jogadores[j]] = [jogadores[j], jogadores[i]];
        }

        const nomes = ['Time Vermelho 🔴', 'Time Azul 🔵', 'Time Verde 🟢', 'Time Amarelo 🟡'];
        const times = [];

        for (let i = 0; i < this.NUM_TIMES; i++) {
            times.push({
                nome: nomes[i],
                jogadores: jogadores.slice(i * this.JOGADORES_POR_TIME, (i + 1) * this.JOGADORES_POR_TIME)
            });
        }

        this.renderTimes(times);
        this.elTeamsSection.style.display = 'block';
        this.showToast('Times sorteados com sucesso! 🎲', 'sucesso');
    }

    // ==========================================
    //  EXPORTAR (admin)
    // ==========================================
    exportarLista() {
        if (!this.isAdmin) {
            this.showToast('Apenas administradores podem exportar!', 'erro');
            return;
        }

        let txt = '🏐 LISTA DE VÔLEI\n';
        txt += '═'.repeat(40) + '\n';
        txt += `📅 ${new Date().toLocaleString('pt-BR')}\n\n`;

        txt += `✅ CONFIRMADOS (${this.confirmados.length}/${this.MAX_JOGADORES})\n`;
        txt += '─'.repeat(30) + '\n';
        if (this.confirmados.length > 0) {
            this.confirmados.forEach((j, i) => {
                txt += `  ${String(i + 1).padStart(2, '0')}. ${j.nome} (${j.horario})\n`;
            });
        } else {
            txt += '  Nenhum jogador\n';
        }

        txt += '\n⏳ LISTA DE ESPERA (' + this.espera.length + ')\n';
        txt += '─'.repeat(30) + '\n';
        if (this.espera.length > 0) {
            this.espera.forEach((j, i) => {
                txt += `  ${String(i + 1).padStart(2, '0')}. ${j.nome} (${j.horario})\n`;
            });
        } else {
            txt += '  Nenhum jogador\n';
        }

        txt += '\n❌ DESISTÊNCIAS (' + this.desistencias.length + ')\n';
        txt += '─'.repeat(30) + '\n';
        if (this.desistencias.length > 0) {
            this.desistencias.forEach((j, i) => {
                txt += `  ${String(i + 1).padStart(2, '0')}. ${j.nome}\n`;
            });
        } else {
            txt += '  Nenhuma desistência\n';
        }

        navigator.clipboard.writeText(txt).then(() => {
            this.showToast('Lista copiada! 📋', 'sucesso');
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = txt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast('Lista copiada! 📋', 'sucesso');
        });
    }

    // ==========================================
    //  RESETAR (admin)
    // ==========================================
    resetarTudo() {
        this.confirmados = [];
        this.espera = [];
        this.desistencias = [];
        this.forcadoAberto = false;
        this.forcadoFechado = false;
        this.elTeamsGrid.innerHTML = '';
        this.elTeamsSection.style.display = 'none';
        this.salvarDados();
        this.renderAll();
        this.atualizarStatusHorario();
        this.showToast('Todas as listas foram limpas! 🗑️', 'info');
    }

    // ==========================================
    //  RENDER
    // ==========================================
    renderAll() {
        this.renderConfirmados();
        this.renderEspera();
        this.renderDesistencias();
        this.renderStats();
    }

    renderConfirmados() {
        if (this.confirmados.length === 0) {
            this.listaConfirmados.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-volleyball-ball"></i>
                    <p>Nenhum jogador inscrito ainda</p>
                </div>`;
            return;
        }

        this.listaConfirmados.innerHTML = this.confirmados.map((j, i) => `
            <div class="player-item">
                <div class="player-position confirmado">${i + 1}</div>
                <span class="player-name">${j.nome}</span>
                <span class="player-time">${j.horario}</span>
                <div class="player-actions ${this.isAdmin ? '' : 'hidden'}">
                    <button class="btn-player btn-desistir"
                        onclick="sistema.confirmarDesistencia('${j.id}', '${j.nome}')"
                        title="Mover para desistências">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                    <button class="btn-player btn-remover"
                        onclick="sistema.confirmarRemocao('${j.id}', '${j.nome}', 'confirmados')"
                        title="Remover permanentemente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderEspera() {
        if (this.espera.length === 0) {
            this.listaEspera.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hourglass-half"></i>
                    <p>Nenhum jogador em espera</p>
                </div>`;
            return;
        }

        this.listaEspera.innerHTML = this.espera.map((j, i) => `
            <div class="player-item">
                <div class="player-position espera">${i + 1}</div>
                <span class="player-name">${j.nome}</span>
                <span class="player-time">${j.horario}</span>
                <div class="player-actions ${this.isAdmin ? '' : 'hidden'}">
                    <button class="btn-player btn-desistir"
                        onclick="sistema.confirmarDesistencia('${j.id}', '${j.nome}')"
                        title="Mover para desistências">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                    <button class="btn-player btn-remover"
                        onclick="sistema.confirmarRemocao('${j.id}', '${j.nome}', 'espera')"
                        title="Remover permanentemente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderDesistencias() {
        if (this.desistencias.length === 0) {
            this.listaDesistencias.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-smile"></i>
                    <p>Nenhuma desistência</p>
                </div>`;
            return;
        }

        this.listaDesistencias.innerHTML = this.desistencias.map((j, i) => `
            <div class="player-item">
                <div class="player-position desistente">${i + 1}</div>
                <span class="player-name" style="text-decoration: line-through; opacity: 0.6;">
                    ${j.nome}
                </span>
                <span class="player-time">${j.horarioDesistencia || j.horario}</span>
                <div class="player-actions ${this.isAdmin ? '' : 'hidden'}">
                    <button class="btn-player btn-retornar"
                        onclick="sistema.confirmarRetorno('${j.id}', '${j.nome}')"
                        title="Retornar à lista">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn-player btn-remover"
                        onclick="sistema.confirmarRemocao('${j.id}', '${j.nome}', 'desistencias')"
                        title="Remover permanentemente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderStats() {
        const tc = this.confirmados.length;
        const te = this.espera.length;
        const td = this.desistencias.length;

        this.elTotalConfirmados.textContent = tc;
        this.elTotalEspera.textContent = te;
        this.elTotalDesistencias.textContent = td;
        this.elBadgeConfirmados.textContent = `${tc}/${this.MAX_JOGADORES}`;
        this.elBadgeEspera.textContent = te;
        this.elBadgeDesistencias.textContent = td;

        const pct = (tc / this.MAX_JOGADORES) * 100;
        this.elBarraConfirmados.style.width = `${pct}%`;

        if (pct >= 100) {
            this.elBarraConfirmados.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        } else if (pct >= 75) {
            this.elBarraConfirmados.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            this.elBarraConfirmados.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
        }
    }

    renderTimes(times) {
        this.elTeamsGrid.innerHTML = times.map(time => `
            <div class="team-card">
                <div class="team-header">${time.nome}</div>
                <div class="team-players">
                    ${time.jogadores.map((j, idx) => `
                        <div class="team-player">
                            <span class="team-player-number">${idx + 1}</span>
                            <span>${j.nome}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    //  MODAIS
    // ==========================================
    confirmarDesistencia(id, nome) {
        this.abrirModal(
            'Confirmar Desistência',
            `Mover "${nome}" para a lista de desistências?`,
            () => this.desistirJogador(id)
        );
    }

    confirmarRetorno(id, nome) {
        this.abrirModal(
            'Confirmar Retorno',
            `Retornar "${nome}" à lista de jogadores?`,
            () => this.retornarJogador(id)
        );
    }

    confirmarRemocao(id, nome, lista) {
        this.abrirModal(
            'Remover Jogador',
            `Remover "${nome}" permanentemente?`,
            () => this.removerJogador(id, lista)
        );
    }

    abrirModal(titulo, mensagem, callback) {
        this.elModalTitulo.textContent = titulo;
        this.elModalMensagem.textContent = mensagem;
        this.elModalInputContainer.style.display = 'none';
        this.elModalInput.value = '';
        this.elModalInput2.value = '';
        this.elModalInput2.style.display = 'none';
        this.modalCallback = callback;
        this.elModalOverlay.classList.add('active');
    }

    abrirModalComInput(titulo, mensagem, placeholder, placeholder2, showSecond, callback) {
        this.elModalTitulo.textContent = titulo;
        this.elModalMensagem.textContent = mensagem;
        this.elModalInputContainer.style.display = 'block';
        this.elModalInput.placeholder = placeholder;
        this.elModalInput.value = '';
        this.elModalInput2.value = '';

        if (showSecond) {
            this.elModalInput2.style.display = 'block';
            this.elModalInput2.placeholder = placeholder2;
        } else {
            this.elModalInput2.style.display = 'none';
        }

        this.modalCallback = callback;
        this.elModalOverlay.classList.add('active');
        setTimeout(() => this.elModalInput.focus(), 100);
    }

    fecharModal() {
        this.elModalOverlay.classList.remove('active');
        this.modalCallback = null;
    }

    // ==========================================
    //  UTILIDADES
    // ==========================================
    gerarId() {
        return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    capitalizarNome(nome) {
        const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
        return nome.toLowerCase().split(' ').map(p => {
            if (preposicoes.includes(p)) return p;
            return p.charAt(0).toUpperCase() + p.slice(1);
        }).join(' ');
    }

    getHorarioAtual() {
        return new Date().toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    }
}

// ===== INICIALIZAR =====
const sistema = new VoleiListaSystem();
