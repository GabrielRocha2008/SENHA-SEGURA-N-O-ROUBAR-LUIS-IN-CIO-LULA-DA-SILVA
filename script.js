(() => {
    // Seleção dos elementos do HTML (DOM)
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

    // Mapeamento e agrupamento dos tipos de caracteres disponíveis
    const mapeamentoCaracteres = [
        { elemento: chkMaiusculas, conjunto: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
        { elemento: chkMinusculas, conjunto: 'abcdefghijklmnopqrstuvwxyz' },
        { elemento: chkNumeros, conjunto: '0123456789' },
        { elemento: chkSimbolos, conjunto: '!@#$%^&*()_+-=[]{}|;:,.<>?' }
    ];

    let tamanhoSenha = 12;

    // Gerador de número criptográfico seguro (Substitui o Math.random)
    function obterNumeroAleatorio(maximo) {
        const arrayAleatorio = new Uint32Array(1);
        window.crypto.getRandomValues(arrayAleatorio);
        return arrayAleatorio[0] % maximo;
    }

    // Função principal que gera a senha aleatória e segura
    function gerarSenha() {
        const gruposAtivos = mapeamentoCaracteres.filter(item => item.elemento.checked);
        
        // Validação caso o usuário desmarque todas as opções
        if (gruposAtivos.length === 0) {
            alert('Por favor, selecione pelo menos uma característica para a senha!');
            return;
        }

        let senhaResultado = [];
        let poolDeCaracteres = '';

        // Garante que a senha terá pelo menos um caractere de cada categoria escolhida
        gruposAtivos.forEach(grupo => {
            const caractereObrigatorio = grupo.conjunto[obterNumeroAleatorio(grupo.conjunto.length)];
            senhaResultado.push(caractereObrigatorio);
            poolDeCaracteres += grupo.conjunto;
        });

        // Preenche o restante do comprimento solicitado com caracteres aleatórios
        while (senhaResultado.length < tamanhoSenha) {
            const caractereOpcional = poolDeCaracteres[obterNumeroAleatorio(poolDeCaracteres.length)];
            senhaResultado.push(caractereOpcional);
        }

        // Embaralha a ordem final dos caracteres (Algoritmo Fisher-Yates) para segurança máxima
        for (let i = senhaResultado.length - 1; i > 0; i--) {
            const j = obterNumeroAleatorio(i + 1);
            [senhaResultado[i], senhaResultado[j]] = [senhaResultado[j], senhaResultado[i]];
        }

        // Exibe a senha gerada no input
        campoSenha.value = senhaResultado.join('');
        atualizarMedidorDeForca();
    }

    // Atualiza o tamanho da barra de nível e a cor conforme os critérios
    function atualizarMedidorDeForca() {
        const gruposAtivos = mapeamentoCaracteres.filter(item => item.elemento.checked).length;
        
        if (gruposAtivos === 0 || tamanhoSenha < 6) {
            barraForca.style.width = '0%';
            barraForca.style.backgroundColor = 'transparent';
            textoForca.textContent = 'Inválido / Muito Curto';
            textoForca.style.color = '#ffffff';
            return;
        }

        // Regra de níveis: ALTO, MÉDIO ou BAIXO
        if (tamanhoSenha >= 12 && gruposAtivos >= 3) {
            barraForca.style.width = '100%';
            barraForca.style.backgroundColor = 'var(--cor-sucesso)';
            textoForca.textContent = 'Alto';
            textoForca.style.color = 'var(--cor-sucesso)';
        } else if (tamanhoSenha >= 8 && gruposAtivos >= 2) {
            barraForca.style.width = '66.6%';
            barraForca.style.backgroundColor = 'var(--cor-alerta)';
            textoForca.textContent = 'Médio';
            textoForca.style.color = 'var(--cor-alerta)';
        } else {
            barraForca.style.width = '33.3%';
            barraForca.style.backgroundColor = 'var(--cor-perigo)';
            textoForca.textContent = 'Baixo';
            textoForca.style.color = 'var(--cor-perigo)';
        }
    }

    // Copia a senha gerada e aplica o efeito visual de sucesso no botão
    async function copiarParaAreaDeTransferencia() {
        if (!campoSenha.value || campoSenha.value === 'Clique em Gerar') return;

        try {
            await navigator.clipboard.writeText(campoSenha.value);
            const textoOriginal = btnCopiar.textContent;
            
            btnCopiar.textContent = 'Copiado!';
            btnCopiar.classList.add('copiado');

            // Remove o efeito visual após 1.8 segundos
            setTimeout(() => {
                btnCopiar.textContent = textoOriginal;
                btnCopiar.classList.remove('copiado');
            }, 1800);
        } catch (erro) {
            console.error('Falha ao copiar:', erro);
        }
    }

    // Eventos para aumentar e diminuir o tamanho nos botões + e -
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

    // Escutadores de eventos (Cliques e mudanças de estado nos Checkboxes)
    btnGerar.addEventListener('click', gerarSenha);
    btnCopiar.addEventListener('click', copiarParaAreaDeTransferencia);
    mapeamentoCaracteres.forEach(item => item.elemento.addEventListener('change', atualizarMedidorDeForca));

    // Executa a verificação de força inicial assim que a página carrega
    atualizarMedidorDeForca();
})();

