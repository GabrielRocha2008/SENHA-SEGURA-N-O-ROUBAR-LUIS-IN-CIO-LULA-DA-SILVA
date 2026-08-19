document.addEventListener("DOMContentLoaded", () => {
    // Seleção dos elementos do HTML
    const campoSenha = document.getElementById('campo-senha');
    const btnCopiar = document.getElementById('btn-copiar');
    const btnGerar = document.getElementById('btn-gerar') || document.querySelector('.botao-gerar');
    const btnMenos = document.getElementById('btn-menos');
    const btnMais = document.getElementById('btn-mais');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    const chkMaiusculas = document.getElementById('chk-maiusculas');
    const chkMinusculas = document.getElementById('chk-minusculas');
    const chkNumeros = document.getElementById('chk-numeros');
    const chkSimbolos = document.getElementById('chk-simbolos');

    const barraForca = document.getElementById('barra-forca');
    const textoForca = document.getElementById('texto-forca');

    let tamanhoSenha = 12;

    // Garante o comportamento visual inicial da barra
    if (barraForca) {
        barraForca.style.display = "block";
        barraForca.style.height = "100%";
    }

    // Sorteia aleatoriamente o nível e a cor da barra
    function definirForcaAleatoria() {
        if (!barraForca) return;

        const sorteio = Math.floor(Math.random() * 3) + 1;

        if (sorteio === 1) {
            // 🟥 BAIXO (Vermelho)
            barraForca.style.setProperty('width', '33.3%', 'important');
            barraForca.style.setProperty('background-color', '#ff3333', 'important');
            if (textoForca) {
                textoForca.textContent = 'Baixo';
                textoForca.style.color = '#ff3333';
            }
        } else if (sorteio === 2) {
            // 🟨 MÉDIO (Amarelo)
            barraForca.style.setProperty('width', '66.6%', 'important');
            barraForca.style.setProperty('background-color', '#ffbb00', 'important');
            if (textoForca) {
                textoForca.textContent = 'Médio';
                textoForca.style.color = '#ffbb00';
            }
        } else {
            // 🟩 ALTO (Verde)
            barraForca.style.setProperty('width', '100%', 'important');
            barraForca.style.setProperty('background-color', '#00ff88', 'important');
            if (textoForca) {
                textoForca.textContent = 'Alto';
                textoForca.style.color = '#00ff88';
            }
        }
    }

    // Reseta a barra se o usuário desmarcar tudo ou deixar muito curto
    function verificarEstadoInicial() {
        let gruposAtivos = 0;
        if (chkMaiusculas && chkMaiusculas.checked) gruposAtivos++;
        if (chkMinusculas && chkMinusculas.checked) gruposAtivos++;
        if (chkNumeros && chkNumeros.checked) gruposAtivos++;
        if (chkSimbolos && chkSimbolos.checked) gruposAtivos++;

        if (gruposAtivos === 0 || tamanhoSenha < 6) {
            barraForca.style.setProperty('width', '0%', 'important');
            barraForca.style.setProperty('background-color', 'transparent', 'important');
            if (textoForca) {
                textoForca.textContent = 'Escolha as opções';
                textoForca.style.color = '#ffffff';
            }
            return false;
        }
        return true;
    }

    // Lógica Criptográfica de Geração de Senha
    function gerarSenha() {
        const mapeamento = [
            { elemento: chkMaiusculas, conjunto: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
            { elemento: chkMinusculas, conjunto: 'abcdefghijklmnopqrstuvwxyz' },
            { elemento: chkNumeros, conjunto: '0123456789' },
            { elemento: chkSimbolos, conjunto: '!@#$%^&*()_+-=[]{}|;:,.<>?' }
        ];

        const gruposAtivos = mapeamento.filter(item => item.elemento && item.elemento.checked);
        
        if (gruposAtivos.length === 0) {
            alert('Por favor, selecione pelo menos uma característica para a senha!');
            return;
        }

        let senhaResultado = [];
        let poolDeCaracteres = '';

        const arrayAleatorio = new Uint32Array(64);
        window.crypto.getRandomValues(arrayAleatorio);
        let idxCrypto = 0;

        gruposAtivos.forEach(grupo => {
            const numAleatorio = arrayAleatorio[idxCrypto++] % grupo.conjunto.length;
            senhaResultado.push(grupo.conjunto[numAleatorio]);
            poolDeCaracteres += grupo.conjunto;
        });

        while (senhaResultado.length < tamanhoSenha) {
            const numAleatorio = arrayAleatorio[idxCrypto++ % arrayAleatorio.length] % poolDeCaracteres.length;
            senhaResultado.push(poolDeCaracteres[numAleatorio]);
        }

        for (let i = senhaResultado.length - 1; i > 0; i--) {
            const j = arrayAleatorio[i % arrayAleatorio.length] % (i + 1);
            [senhaResultado[i], senhaResultado[j]] = [senhaResultado[j], senhaResultado[i]];
        }

        if (campoSenha) campoSenha.value = senhaResultado.join('');
        
        // Chama o sorteador aleatório de força toda vez que uma senha nova nasce
        definirForcaAleatoria();
    }

    // Copiar para a área de transferência
    async function copiarParaAreaDeTransferencia() {
        if (!campoSenha || !campoSenha.value || campoSenha.value === 'Clique em Gerar') return;
        try {
            await navigator.clipboard.writeText(campoSenha.value);
            const textoOriginal = btnCopiar.textContent;
            btnCopiar.textContent = 'Copiado!';
            btnCopiar.classList.add('copiado');
            setTimeout(() => {
                btnCopiar.textContent = textoOriginal;
                btnCopiar.classList.remove('copiado');
            }, 1800);
        } catch (erro) {
            console.error("Erro ao copiar:", erro);
        }
    }

    // Controles de clique (+ e -)
    if (btnMais) {
        btnMais.addEventListener('click', () => {
            if (tamanhoSenha < 32) {
                tamanhoSenha++;
                if (contadorCaracteres) contadorCaracteres.textContent = tamanhoSenha;
                if (verificarEstadoInicial()) definirForcaAleatoria();
            }
        });
    }

    if (btnMenos) {
        btnMenos.addEventListener('click', () => {
            if (tamanhoSenha > 6) {
                tamanhoSenha--;
                if (contadorCaracteres) contadorCaracteres.textContent = tamanhoSenha;
                if (verificarEstadoInicial()) definirForcaAleatoria();
            }
        });
    }

    // CORREÇÃO AQUI: Nome da função corrigido para casar exatamente com o clique do botão
    if (btnGerar) btnGerar.addEventListener('click', gerarSenha);
    if (btnCopiar) btnCopiar.addEventListener('click', copiarParaAreaDeTransferencia);

    // Atualiza aleatoriamente se mexer nos checkboxes também
    [chkMaiusculas, chkMinusculas, chkNumeros, chkSimbolos].forEach(item => {
        if (item) {
            item.addEventListener('change', () => {
                if (verificarEstadoInicial()) definirForcaAleatoria();
            });
        }
    });

    // Sorteia uma força inicial ao carregar o site pela primeira vez
    if (verificarEstadoInicial()) definirForcaAleatoria();
});
