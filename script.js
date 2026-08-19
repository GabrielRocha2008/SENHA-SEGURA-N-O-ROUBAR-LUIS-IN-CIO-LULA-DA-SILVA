document.addEventListener("DOMContentLoaded", () => {
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

    let tamanhoSenha = 12;

    function definirForcaAleatoria() {
        if (!barraForca) return;
        const sorteio = Math.floor(Math.random() * 3) + 1;

        if (sorteio === 1) {
            barraForca.style.setProperty('width', '33.3%', 'important');
            barraForca.style.setProperty('background-color', '#ff3333', 'important');
            if (textoForca) {
                textoForca.textContent = 'Baixo';
                textoForca.style.color = '#ff3333';
            }
        } else if (sorteio === 2) {
            barraForca.style.setProperty('width', '66.6%', 'important');
            barraForca.style.setProperty('background-color', '#ffbb00', 'important');
            if (textoForca) {
                textoForca.textContent = 'Médio';
                textoForca.style.color = '#ffbb00';
            }
        } else {
            barraForca.style.setProperty('width', '100%', 'important');
            barraForca.style.setProperty('background-color', '#00ff88', 'important');
            if (textoForca) {
                textoForca.textContent = 'Alto';
                textoForca.style.color = '#00ff88';
            }
        }
    }

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

        gruposAtivos.forEach(grupo => {
            const numAleatorio = Math.floor(Math.random() * grupo.conjunto.length);
            senhaResultado.push(grupo.conjunto[numAleatorio]);
            poolDeCaracteres += grupo.conjunto;
        });

        while (senhaResultado.length < tamanhoSenha) {
            const numAleatorio = Math.floor(Math.random() * poolDeCaracteres.length);
            senhaResultado.push(poolDeCaracteres[numAleatorio]);
        }

        for (let i = senhaResultado.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [senhaResultado[i], senhaResultado[j]] = [senhaResultado[j], senhaResultado[i]];
        }

        if (campoSenha) campoSenha.value = senhaResultado.join('');
        definirForcaAleatoria();
    }

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

    if (btnGerar) btnGerar.addEventListener('click', gerarSenha);
    if (btnCopiar) btnCopiar.addEventListener('click', copiarParaAreaDeTransferencia);

    [chkMaiusculas, chkMinusculas, chkNumeros, chkSimbolos].forEach(item => {
        if (item) {
            item.addEventListener('change', () => {
                if (verificarEstadoInicial()) definirForcaAleatoria();
            });
        }
    });

    if (verificarEstadoInicial()) definirForcaAleatoria();
});
