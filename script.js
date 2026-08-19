(() => {
    // Seleção dos elementos DOM
    const campoSenha = document.getElementById('campo-senha');
    const btnCopiar = document.getElementById('btn-copiar');
    const btnGerar = document.getElementById('btn-gerar');
    const btnMenos = document.getElementById('btn-menos');
    const btnMais = document.getElementById('btn-mais');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    const chkMaiusculas = document.getElementById('chk-maiusculas');
    const chkMinusculas = document.getElementById('chk-minusculas');
    const chkNumeros = document.getElementById('chk-numeros');
    const chkSimbolos = document.getElementById('chk-simbolos');

    const barraForca = document.getElementById('barra-forca');
    const textoForca = document.getElementById('texto-forca');

    // Grupos de caracteres estruturados
    const mapeamentoCaracteres = [
        { elemento: chkMaiusculas, conjunto: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
        { elemento: chkMinusculas, conjunto: 'abcdefghijklmnopqrstuvwxyz' },
        { elemento: chkNumeros, conjunto: '0123456789' },
        { elemento: chkSimbolos, conjunto: '!@#$%^&*()_+-=[]{}|;:,.<>?' }
    ];

    let tamanhoSenha = 12;

    // Gerador de número criptográfico seguro (Substitui o Math.random convencional)
    function obterNumeroAleatorio(maximo) {
        const arrayAleatorio = new Uint32Array(1);
        window.crypto.getRandomValues(arrayAleatorio);
        return arrayAleatorio[0] % maximo;
    }

    // Função para gerar a senha aleatória e embaralhada
    function gerarSenha() {
        const gruposAtivos = mapeamentoCaracteres.filter(item => item.elemento.checked);
        
        if (gruposAtivos.length === 0) {
            alert('Por favor, selecione pelo menos uma característica para a senha!');
            return;
        }

        let senhaResultado = [];
        let poolDeCaracteres = '';

        // Garante a presença de pelo menos um caractere de cada tipo marcado pelo usuário
        gruposAtivos.forEach(grupo => {
            const caractereObrigatorio = grupo.conjunto[obterNumeroAleatorio(grupo.conjunto.length)];
            senhaResultado.push(caractereObrigatorio);
            poolDeCaracteres += grupo.conjunto;
        });

        // Preenche o restante do comprimento solicitado
        while (senhaResultado.length < tamanhoSenha) {
            const caractereOpcional = poolDeCaracteres[obterNumeroAleatorio(poolDeCaracteres.length)];
            senhaResultado.push(caractereOpcional);
        }

        // Embaralha o array usando Fisher-Yates
        for (let i = senhaResultado.length - 1; i > 0; i--) {
            const j = obterNumeroAleatorio(i + 1);
            [senhaResultado[i], senhaResultado[j]] = [senhaResultado[j], senhaResultado[i]];
        }

        campoSenha.value = senhaResultado.join('');
        atualizarMedidorDeForca();
    }

    // Gerenciador da barra de força dinâmica por cores diretas
    function atualizarMedidorDeForca() {
        const gruposAtivos = mapeamentoCaracteres.filter(item => item.elemento.checked).length;
        
        // Estado sem opções marcadas ou tamanho inválido
        if (gruposAtivos === 0 || tamanhoSenha < 6) {
            barraForca.style.width = '0%';
            barraForca.style.backgroundColor = 'transparent';
            textoForca.textContent = 'Escolha as opções';
            textoForca.style.color = '#ffffff';
            return;
        }

        // Nível ALTO (Verde)
        if (tamanhoSenha >= 12 && gruposAtivos >= 3) {
            barraForca.style.width = '100%';
            barraForca.style.backgroundColor = '#00ff88'; // VERDE
            textoForca.textContent = 'Alto';
            textoForca.style.color = '#00ff88';
        } 
        // Nível MÉDIO (Amarelo)
        else if (tamanhoSenha >= 8 && gruposAtivos >= 2) {
            barraForca.style.width = '66.6%';
            barraForca.style.backgroundColor = '#ffbb00'; // AMARELO
            textoForca.textContent = 'Médio';
            textoForca.style.color = '#ffbb00';
        } 
        // Nível BAIXO (Vermelho)
        else {
            barraForca.style.width = '33.3%';
            barraForca.style.backgroundColor = '#ff3333'; // VERMELHO
            textoForca.textContent = 'Baixo';
            textoForca.style.color = '#ff3333';
        }
    }

    // Copia a senha gerada com efeito visual de sucesso temporário
    async function copiarParaAreaDeTransferencia() {
        if (!campoSenha.value || campoSenha.value === 'Clique em Gerar') return;

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
            console.error('Falha ao copiar:', erro);
        }
    }

    // Ouvintes de evento dos botões de controle de tamanho (+ e -)
    btnMais.addEventListener('click', () => {
        if (tamanhoSenha < 32) {
            tamanhoSenha++;
            contadorCaracteres.textContent = tamanhoSenha;
            atualizarMedidorDeForca();
        }
    });

    btnMenos.addEventListener('click', () => {
        if (tamanhoSenha > 6) {
            tamanhoSenha--;
            contadorCaracteres.textContent = tamanhoSenha;
            atualizarMedidorDeForca();
        }
    });

    // Vinculação dos disparadores de evento
    btnGerar.addEventListener('click', gerarSenha);
    btnCopiar.addEventListener('click', copiarParaAreaDeTransferencia);
    mapeamentoCaracteres.forEach(item => item.elemento.addEventListener('change', atualizarMedidorDeForca));

    // Inicialização da interface
    atualizarMedidorDeForca();
})();
