document.addEventListener("DOMContentLoaded", () => {
    // Seleção dos elementos com proteção
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

    // Força a barra a ter o comportamento visual correto de bloco
    if (barraForca) {
        barraForca.style.display = "block";
        barraForca.style.height = "100%";
    }

    // NOVA LÓGICA: Calcula a força real baseada na complexidade dos caracteres selecionados
    function atualizarMedidorDeForca() {
        if (!barraForca) return;

        // 1. Conta a variedade (quantos tipos diferentes de caracteres estão ativos)
        let tiposDiferentes = 0;
        if (chkMaiusculas && chkMaiusculas.checked) tiposDiferentes++;
        if (chkMinusculas && chkMinusculas.checked) tiposDiferentes++;
        if (chkNumeros && chkNumeros.checked) tiposDiferentes++;
        if (chkSimbolos && chkSimbolos.checked) tiposDiferentes++;
        
        // Se nada estiver marcado ou tamanho for crítico, a senha é inválida
        if (tiposDiferentes === 0 || tamanhoSenha < 6) {
            barraForca.style.setProperty('width', '0%', 'important');
            barraForca.style.setProperty('background-color', 'transparent', 'important');
            if (textoForca) {
                textoForca.textContent = 'Escolha as opções';
                textoForca.style.color = '#ffffff';
            }
            return;
        }

        // 2. Classificação rigorosa por Variedade de Caracteres + Comprimento
        
        // CASO 1: ALTO / FORTE (Verde)
        // Requisitos: Pelo menos 12 caracteres E combinando 3 ou mais tipos de caracteres diferentes
        if (tamanhoSenha >= 12 && tiposDiferentes >= 3) {
            barraForca.style.setProperty('width', '100%', 'important');
            barraForca.style.setProperty('background-color', '#00ff88', 'important'); // VERDE
            if (textoForca) {
                textoForca.textContent = 'Alto';
                textoForca.style.color = '#00ff88';
            }
        } 
        // CASO 2: MÉDIO (Amarelo)
        // Requisitos: Senhas medianas (8 a 11 letras) com boa mistura, OU senhas longas mas com pouca mistura (apenas 2 tipos)
        else if ((tamanhoSenha >= 8 && tiposDiferentes >= 2) || (tamanhoSenha >= 12 && tiposDiferentes === 2)) {
            barraForca.style.setProperty('width', '66.6%', 'important');
            barraForca.style.setProperty('background-color', '#ffbb00', 'important'); // AMARELO
            if (textoForca) {
                textoForca.textContent = 'Médio';
                textoForca.style.color = '#ffbb00';
            }
        } 
        // CASO 3: BAIXO / FRACO (Vermelho)
        // Requisitos: Menos de 8 caracteres OU usando apenas 1 tipo de caractere (ex: apenas números, mesmo que seja longo)
        else {
            barraForca.style.setProperty('width', '33.3%', 'important');
            barraForca.style.setProperty('background-color', '#ff3333', 'important'); // VERMELHO
            if (textoForca) {
                textoForca.textContent = 'Baixo';
                textoForca.style.color = '#ff3333';
            }
        }
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

        // Garante a regra de negócio: pelo menos um caractere de cada tipo marcado estará na senha
        gruposAtivos.forEach(grupo => {
            const numAleatorio = arrayAleatorio[idxCrypto++] % grupo.conjunto.length;
            senhaResultado.push(grupo.conjunto[numAleatorio]);
            poolDeCaracteres += grupo.conjunto;
        });

        // Preenche o resto da senha de forma aleatória
        while (senhaResultado.length < tamanhoSenha) {
            const numAleatorio = arrayAleatorio[idxCrypto++ % arrayAleatorio.length] % poolDeCaracteres.length;
            senhaResultado.push(poolDeCaracteres[numAleatorio]);
        }

        // Embaralha o resultado final para que os obrigatórios não fiquem sempre no começo
        for (let i = senhaResultado.length - 1; i > 0; i--) {
            const j = arrayAleatorio[i % arrayAleatorio.length] % (i + 1);
            [senhaResultado[i], senateResultado[j]] = [senhaResultado[j], senhaResultado[i]];
        }

        if (campoSenha) campoSenha.value = senhaResultado.join('');
        atualizarMedidorDeForca();
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

    // Configuração dos controles de clique (+ e -)
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
            if (tamanhoSenha > 6) {
                tamanhoSenha--;
                if (contadorCaracteres) contadorCaracteres.textContent = tamanhoSenha;
                atualizarMedidorDeForca();
            }
        });
    }

    if (btnGerar) btnGerar.addEventListener('click', gerarSenha);
    if (btnCopiar) btnCopiar.addEventListener('click', copiarParaAreaDeTransferencia);

    // Escuta em tempo real a mudança dos botões de marcar para mexer na barra instantaneamente
    [chkMaiusculas, chkMinusculas, chkNumeros, chkSimbolos].forEach(item => {
        if (item) item.addEventListener('change', atualizarMedidorDeForca);
    });

    // Roda no carregamento inicial da página
    atualizarMedidorDeForca();
});
