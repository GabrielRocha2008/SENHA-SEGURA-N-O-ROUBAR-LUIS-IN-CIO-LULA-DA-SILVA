document.addEventListener("DOMContentLoaded", () => {
    // 1. Seleção dos elementos com proteção (caso algum ID mude)
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

    // 2. FORÇAR A BARRA A EXISTIR VISUALMENTE VIA JAVASCRIPT
    if (barraForca) {
        barraForca.style.display = "block";
        barraForca.style.height = "100%";
    }

    // 3. Função do Medidor de Força com injeção direta de estilo
    function atualizarMedidorDeForca() {
        if (!barraForca) return;

        // Conta quantos checkboxes estão marcados
        let gruposAtivos = 0;
        if (chkMaiusculas && chkMaiusculas.checked) gruposAtivos++;
        if (chkMinusculas && chkMinusculas.checked) gruposAtivos++;
        if (chkNumeros && chkNumeros.checked) gruposAtivos++;
        if (chkSimbolos && chkSimbolos.checked) gruposAtivos++;
        
        // Estado sem opções marcadas
        if (gruposAtivos === 0 || tamanhoSenha < 6) {
            barraForca.style.setProperty('width', '0%', 'important');
            barraForca.style.setProperty('background-color', 'transparent', 'important');
            if (textoForca) {
                textoForca.textContent = 'Escolha as opções';
                textoForca.style.color = '#ffffff';
            }
            return;
        }

        // Nível ALTO (Verde)
        if (tamanhoSenha >= 12 && gruposAtivos >= 3) {
            barraForca.style.setProperty('width', '100%', 'important');
            barraForca.style.setProperty('background-color', '#00ff88', 'important'); 
            if (textoForca) {
                textoForca.textContent = 'Alto';
                textoForca.style.color = '#00ff88';
            }
        } 
        // Nível MÉDIO (Amarelo)
        else if (tamanhoSenha >= 8 && gruposAtivos >= 2) {
            barraForca.style.setProperty('width', '66.6%', 'important');
            barraForca.style.setProperty('background-color', '#ffbb00', 'important'); 
            if (textoForca) {
                textoForca.textContent = 'Médio';
                textoForca.style.color = '#ffbb00';
            }
        } 
        // Nível BAIXO (Vermelho)
        else {
            barraForca.style.setProperty('width', '33.3%', 'important');
            barraForca.style.setProperty('background-color', '#ff3333', 'important'); 
            if (textoForca) {
                textoForca.textContent = 'Baixo';
                textoForca.style.color = '#ff3333';
            }
        }
    }

    // 4. Lógica Criptográfica de Geração de Senha
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

        const arrayAleatorio = new Uint32Array(32);
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

        // Embaralhar
        for (let i = senhaResultado.length - 1; i > 0; i--) {
            const j = arrayAleatorio[i % arrayAleatorio.length] % (i + 1);
            [senhaResultado[i], senhaResultado[j]] = [senhaResultado[j], senhaResultado[i]];
        }

        if (campoSenha) campoSenha.value = senhaResultado.join('');
        atualizarMedidorDeForca();
    }

    // 5. Copiar senha
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
            console.error(erro);
        }
    }

    // 6. Configuração dos Ouvintes de Evento com travas de segurança
    if (btnMais) {
        btnMais.addEventListener('click', () => {
            if (tamanhoSenha < 32) {
                tamanhoSenha++;
                if (contadorCaracteres) contadorCaracteres.textContent = tamanhoSenha;
                atualizarMedidorDeForca();
            }
        });
    }

    if (btnMenos) {
        btnMenos.addEventListener('click', () => {
            if (tamanhoSenha < 32) { // Alterado para 60 para não quebrar a lógica de digitação manual
                if (tamanhoSenha > 6) {
                    tamanhoSenha--;
                    if (contadorCaracteres) contadorCaracteres.textContent = tamanhoSenha;
                    atualizarMedidorDeForca();
                }
            }
        });
    }

    if (btnGerar) btnGerar.addEventListener('click', gerarSenha);
    if (btnCopiar) btnCopiar.addEventListener('click', copiarParaAreaDeTransferencia);

    [chkMaiusculas, chkMinusculas, chkNumeros, chkSimbolos].forEach(item => {
        if (item) item.addEventListener('change', atualizarMedidorDeForca);
    });

    // Forçar primeira renderização
    atualizarMedidorDeForca();
});
