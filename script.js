// ===== SISTEMA DE LISTA DE VÔLEI COM FIREBASE V9 =====

// V9: Importar as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    set, 
    update,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// V9: Sua configuração do Firebase que você forneceu
const firebaseConfig = {
  apiKey: "SUA_API_KEY", // SUBSTITUA PELA SUA CHAVE REGENERADA
  authDomain: "lista-de-volei-20h30.firebaseapp.com",
  projectId: "lista-de-volei-20h30",
  databaseURL: "https://lista-de-volei-20h30-default-rtdb.firebaseio.com", // Adicione esta linha se não estiver lá
  storageBucket: "lista-de-volei-20h30.appspot.com",
  messagingSenderId: "885404065182",
  appId: "1:885404065182:web:7775b650a052b74e3fca8f"
};
 
// V9: Inicializa o Firebase e o Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database, 'voleiLista'); // Nó principal no banco

class VoleiListaSystem {
    constructor() {
        this.MAX_JOGADORES = 28;
        this.HORA_ABERTURA = 8;
        this.SENHA_PADRAO = 'admin123';

        this.confirmados = [];
        this.espera = [];
        this.desistencias = [];
        this.isAdmin = false;
        this.forcadoAberto = false;
        this.forcadoFechado = false;
        this.senhaAdmin = this.SENHA_PADRAO;

        this.modalCallback = null;
        this.cacheDom();
        this.init();
    }

    cacheDom() {
        // ... (esta função permanece exatamente a mesma)
        this.form = document.getElementById('formInscricao');
        this.inputNome = document.getElementById('nomeJogador');
        this.mensagem = document.getElementById('mensagem');
        this.formSection = document.getElementById('formSection');
        this.listaConfirmados = document.getElementById('listaConfirmados');
        this.listaEspera = document.getElementById('listaEspera');
        this.listaDesistencias = document.getElementById('listaDesistencias');
        this.elTotalConfirmados = document.getElementById('totalConfirmados');
        this.elTotalEspera = document.getElementById('totalEspera');
        this.elTotalDesistencias = document.getElementById('totalDesistencias');
        this.elBadgeConfirmados = document.getElementById('badgeConfirmados');
        this.elBadgeEspera = document.getElementById('badgeEspera');
        this.elBadgeDesistencias = document.getElementById('badgeDesistencias');
        this.elBarraConfirmados = document.getElementById('barraConfirmados');
        this.elStatusHorario = document.getElementById('statusHorario');
        this.elHoraAtual = document.getElementById('horaAtual');
        this.elCountdownSection = document.getElementById('countdownSection');
        this.elCountHoras = document.getElementById('countHoras');
        this.elCountMinutos = document.getElementById('countMinutos');
        this.elCountSegundos = document.getElementById('countSegundos');
        this.elTeamsSection = document.getElementById('teamsSection');
        this.elTeamsGrid = document.getElementById('teamsGrid');
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
        this.btnAdminForcarAbrir = document.getElementById('btnAdminForcarAbrir');
        this.btnAdminForcarFechar = document.getElementById('btnAdminForcarFechar');
        this.btnAdminSortear = document.getElementById('btnAdminSortear');
        this.btnAdminExportar = document.getElementById('btnAdminExportar');
        this.btnAdminConfig = document.getElementById('btnAdminConfig');
        this.btnAdminResetar = document.getElementById('btnAdminResetar');
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
        this.iniciarListenersFirebase();
        this.criarParticulas();
        this.criarToastContainer();
        this.bindEvents();
        this.iniciarRelogio();
    }
    
    iniciarListenersFirebase() {
        // V9: Sintaxe do listener 'onValue'
        onValue(dbRef, (snapshot) => {
            const dados = snapshot.val();
            if (dados) {
                this.confirmados = dados.confirmados ? Object.values(dados.confirmados) : [];
                this.espera = dados.espera ? Object.values(dados.espera) : [];
                this.desistencias = dados.desistencias ? Object.values(dados.desistencias) : [];

                this.confirmados.sort((a, b) => a.timestamp - b.timestamp);
                this.espera.sort((a, b) => a.timestamp - b.timestamp);
                
                this.senhaAdmin = dados.senhaAdmin || this.SENHA_PADRAO;
                this.forcadoAberto = dados.forcadoAberto || false;
                this.forcadoFechado = dados.forcadoFechado || false;
            } else {
                this.confirmados = [];
                this.espera = [];
                this.desistencias = [];
            }
            
            this.renderAll();
            this.atualizarStatusHorario();
        });
    }

    inscreverJogador() {
        if (!this.inscricoesAbertas()) { this.mostrarMensagem(this.mensagem,'🔒 Inscrições fechadas!', 'erro'); return; }
        const nome = this.inputNome.value.trim();
        if (!nome || nome.length < 2) { this.mostrarMensagem(this.mensagem, 'Nome inválido.', 'erro'); return; }
        const nomeNorm = nome.toLowerCase();
        if ([...this.confirmados, ...this.espera].find(j => j.nome.toLowerCase() === nomeNorm)) { this.mostrarMensagem(this.mensagem,'Este nome já está na lista!', 'erro'); return; }
        if (this.desistencias.find(j => j.nome.toLowerCase() === nomeNorm)) { this.mostrarMensagem(this.mensagem,'Você já desistiu. Peça a um admin para retornar.', 'info'); return; }

        const jogador = {
            id: this.gerarId(),
            nome: this.capitalizarNome(nome),
            horario: this.getHorarioAtual(),
            timestamp: serverTimestamp() // V9: Sintaxe para timestamp do servidor
        };

        if (this.confirmados.length < this.MAX_JOGADORES) {
            // V9: Escreve no Firebase usando 'set' e 'ref'
            const jogadorRef = ref(database, `voleiLista/confirmados/${jogador.id}`);
            set(jogadorRef, jogador);
            this.mostrarMensagem(this.mensagem, `✅ ${jogador.nome} confirmado(a)!`, 'sucesso');
            this.showToast(`${jogador.nome} confirmado(a)! 🏐`, 'sucesso');
        } else {
            const jogadorRef = ref(database, `voleiLista/espera/${jogador.id}`);
            set(jogadorRef, jogador);
            this.mostrarMensagem(this.mensagem, `⏳ Lista cheia! ${jogador.nome} na espera.`, 'info');
            this.showToast(`${jogador.nome} na lista de espera`, 'info');
        }

        this.inputNome.value = '';
        this.inputNome.focus();
    }

    desistirJogador(id) {
        if (!this.isAdmin) { this.showToast('Apenas administradores podem fazer isso!', 'erro'); return; }
        
        let jogador = this.confirmados.find(j => j.id === id) || this.espera.find(j => j.id === id);
        if (!jogador) return;

        let eraConfirmado = this.confirmados.some(j => j.id === id);
        
        const updates = {};
        jogador.horarioDesistencia = this.getHorarioAtual();
        
        updates[`/voleiLista/confirmados/${id}`] = null;
        updates[`/voleiLista/espera/${id}`] = null;
        updates[`/voleiLista/desistencias/${id}`] = jogador;

        if (eraConfirmado && this.espera.length > 0) {
            const promovido = this.espera[0];
            updates[`/voleiLista/espera/${promovido.id}`] = null;
            updates[`/voleiLista/confirmados/${promovido.id}`] = promovido;
            this.showToast(`${promovido.nome} promovido(a)! 🎉`, 'sucesso');
        }

        // V9: Executa todas as atualizações com a referência raiz do DB
        update(ref(database), updates);
        this.showToast(`${jogador.nome} movido para desistências`, 'info');
    }

    retornarJogador(id) {
        if (!this.isAdmin) { this.showToast('Apenas administradores podem fazer isso!', 'erro'); return; }

        let jogador = this.desistencias.find(j => j.id === id);
        if (!jogador) return;
        
        delete jogador.horarioDesistencia;
        jogador.horario = this.getHorarioAtual();
        jogador.timestamp = serverTimestamp();

        const updates = {};
        updates[`/voleiLista/desistencias/${id}`] = null;

        if (this.confirmados.length < this.MAX_JOGADORES) {
            updates[`/voleiLista/confirmados/${id}`] = jogador;
            this.showToast(`${jogador.nome} retornou e foi confirmado(a)! 🎉`, 'sucesso');
        } else {
            updates[`/voleiLista/espera/${id}`] = jogador;
            this.showToast(`${jogador.nome} retornou para a lista de espera`, 'info');
        }
        
        update(ref(database), updates);
    }
    
    removerJogador(id, lista) {
        if (!this.isAdmin) { this.showToast('Apenas administradores podem fazer isso!', 'erro'); return; }

        const updates = {};
        updates[`/voleiLista/${lista}/${id}`] = null;

        if (lista === 'confirmados' && this.espera.length > 0) {
            const promovido = this.espera[0];
            updates[`/voleiLista/espera/${promovido.id}`] = null;
            updates[`/voleiLista/confirmados/${promovido.id}`] = promovido;
            this.showToast(`${promovido.nome} promovido(a)!`, 'sucesso');
        }

        update(ref(database), updates);
        this.showToast(`Jogador removido(a)`, 'info');
    }

    alterarSenhaAdmin(novaSenha, confirmacao) {
        if (novaSenha.length < 4) { this.showToast('A senha deve ter pelo menos 4 caracteres!', 'erro'); return; }
        if (novaSenha !== confirmacao) { this.showToast('As senhas não coincidem!', 'erro'); return; }
        // V9: Salva no Firebase usando update
        update(dbRef, { senhaAdmin: novaSenha });
        this.showToast('Senha alterada com sucesso!', 'sucesso');
    }
    
    forcarAbertura() {
        update(dbRef, { forcadoAberto: true, forcadoFechado: false });
        this.showToast('Inscrições abertas manualmente!', 'sucesso');
    }
    
    forcarFechamento() {
        update(dbRef, { forcadoAberto: false, forcadoFechado: true });
        this.showToast('Inscrições fechadas manualmente!', 'info');
    }

    resetarTudo() {
        // V9: Pode usar 'set' com um objeto vazio para limpar tudo, ou 'update' com 'null'
        update(dbRef, {
            confirmados: null,
            espera: null,
            desistencias: null,
            forcadoAberto: false,
            forcadoFechado: false
        });
        this.elTeamsGrid.innerHTML = '';
        this.elTeamsSection.style.display = 'none';
        this.showToast('Todas as listas foram limpas! 🗑️', 'info');
    }

    // --- O restante das funções (renderização, UI, utilidades) não precisam de alteração ---
    // --- Copie-as do script anterior. Vou incluir aqui por completude ---

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
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => { e.preventDefault(); this.inscreverJogador(); });
        this.btnAdminToggle.addEventListener('click', () => { if (this.isAdmin) return; const form = this.elAdminLoginForm; form.style.display = form.style.display === 'none' ? 'block' : 'none'; });
        this.btnLogin.addEventListener('click', () => this.loginAdmin());
        this.inputSenhaAdmin.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.loginAdmin(); });
        this.btnLogout.addEventListener('click', () => this.logoutAdmin());
        this.btnAdminForcarAbrir.addEventListener('click', () => this.forcarAbertura());
        this.btnAdminForcarFechar.addEventListener('click', () => this.forcarFechamento());
        this.btnAdminSortear.addEventListener('click', () => this.sortearTimes());
        this.btnAdminExportar.addEventListener('click', () => this.exportarLista());
        this.btnAdminConfig.addEventListener('click', () => {
            this.abrirModalComInput('Alterar Senha de Administrador', 'Digite a nova senha:', 'Nova senha', 'Confirme a nova senha', true, (novaSenha, confirmacao) => this.alterarSenhaAdmin(novaSenha, confirmacao));
        });
        this.btnAdminResetar.addEventListener('click', () => { this.abrirModal('Limpar Todas as Listas', 'Tem certeza que deseja remover TODOS os jogadores?', () => this.resetarTudo()); });
        this.btnModalCancelar.addEventListener('click', () => this.fecharModal());
        this.btnModalConfirmar.addEventListener('click', () => {
            if (this.modalCallback) {
                const inputVisible = this.elModalInputContainer.style.display !== 'none';
                if (inputVisible) { this.modalCallback(this.elModalInput.value, this.elModalInput2.value); } 
                else { this.modalCallback(); }
            }
            this.fecharModal();
        });
        this.elModalOverlay.addEventListener('click', (e) => { if (e.target === this.elModalOverlay) this.fecharModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.fecharModal(); });
    }
    

}


window.sistema = new VoleiListaSystem();
