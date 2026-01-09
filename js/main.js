// --- FUNÇÃO PRINCIPAL ---
async function buscarClima() {
    const input = document.getElementById('inputCidade');
    const btn = document.querySelector('button');
    const termoBusca = input.value;

    if (!termoBusca) {
        alert("Por favor, digite o nome de uma cidade.");
        return;
    }


    btn.innerText = "Buscando...";
    btn.disabled = true;

    try {
        // 1. Busca as coordenadas (Latitude e Longitude) pelo nome da cidade
        const geoURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(termoBusca)}`;
        const geoRes = await fetch(geoURL);
        const geoData = await geoRes.json();

        if (geoData.length === 0) {
            alert("Cidade não encontrada. Tente digitar o nome completo.");
            return;
        }

        const { lat, lon, display_name } = geoData[0];
        const nomeCidadeFormatado = display_name.split(',')[0];

        // 2. Busca o clima usando as coordenadas obtidas
        const climaURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,wind_speed_10m_max&timezone=auto`;
        const climaRes = await fetch(climaURL);
        const climaData = await climaRes.json();
        console.log("DADOS DA API AQUI:", climaData);


        atualizarInterface(climaData, nomeCidadeFormatado);


    } catch (error) {
        console.error("Erro na busca:", error);
        alert("Erro de conexão com o servidor. Tente novamente mais tarde.");
    } finally {
        btn.innerText = "Buscar";
        btn.disabled = false;
    }
}

// --- ATUALIZAÇÃO DA INTERFACE PRINCIPAL ---
function atualizarInterface(dados, nomeCidade) {
    const card = document.getElementById('resultado');
    const container = document.getElementById('previsaosemana');
    const template = document.getElementById('modelo-previsao');

    if (!card || !container || !template) return;


    const codigoClimaGeral = dados.daily?.weathercode?.[0] || 0;
    const ehDia = dados.current?.is_day ?? 1;

    document.getElementById('cidadeTitulo').innerText = nomeCidade;

    if (dados.daily) {
        container.innerHTML = ""; 

        // O LOOP COMEÇA AQUI
        for (let i = 1; i <= 5; i++) {
            const clone = template.content.cloneNode(true);

            // 2. AGORA SIM: Definimos o codigoDia usando o 'i' do loop
            const codigoDia = dados.daily.weathercode[i]; 
            const max = Math.round(dados.daily.temperature_2m_max[i]);
            const min = Math.round(dados.daily.temperature_2m_min[i]);


            clone.querySelector('.data-txt').innerText = formatardata(dados.daily.time[i]);
            clone.querySelector('.condicao-txt').innerText = traduzirCodigo(codigoDia);
            clone.querySelector('.temp-txt').innerText = `${max}° / ${min}°`;
            clone.querySelector('.uv-txt').innerText = `${dados.daily.uv_index_max[i]} UV`;
            clone.querySelector('.vento-txt').innerText = `${dados.daily.wind_speed_10m_max[i]} km/h`;


            const imgTemp = clone.querySelector('.temp-icone');
            if (imgTemp) {
                imgTemp.src = ((max + min) / 2 > 25) ? "Assets/quente.png" : "Assets/frio.png";
            }

            // Ícone do Clima (Sol/Nuvem/Chuva)
            const imgclima = clone.querySelector('.clima-img');
            if (imgclima) {
                if (codigoDia <= 1) {
                    imgclima.src = "Assets/sol.png";
                } else if (codigoDia <= 3) {
                    imgclima.src = "Assets/nublado.png";
                } else if (codigoDia >= 61 || codigoDia === 80) {
                    imgclima.src = "Assets/chuva.png";
                } else {
                    imgclima.src = "Assets/sol.png";
                }
            }

            container.appendChild(clone);
        } 
    }

    atualizarBackground(codigoClimaGeral, ehDia);
    card.classList.remove('hidden');
}
rd.classList.remove('hidden');
    


function formatardata(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', { weekday: 'long' });
}

// --- MUDANÇA DE CORES ---
function atualizarBackground(codigo, dia) {
    const corpo = document.body;
    
    // Limpa as cores anteriores
    corpo.classList.remove('nublado', 'chuva', 'noite');


    if (dia === 0) {
        corpo.classList.add('noite');
        return;
    }


    if (codigo >= 1 && codigo <= 3) {
        corpo.classList.add('nublado');
    } else if (codigo >= 51) {
        corpo.classList.add('chuva');
    }

}

// --- TRADUÇÃO DOS CÓDIGOS DA API ---
function traduzirCodigo(codigo) {
    const codigos = {
        0: "Céu Limpo",
        1: "Principalmente Limpo",
        2: "Parcialmente Nublado",
        3: "Nublado",
        45: "Nevoeiro",
        51: "Drizzle (Garoa)",
        61: "Chuva Leve",
        63: "Chuva Moderada",
        80: "Pancadas de Chuva",
        95: "Trovoada"
    };
    return codigos[codigo] || "Condições Variáveis";
}

function traduzirUV(indice){
    if (indice <3) return "Baixo";
    if (indice <6) return "Moderado";
    if (indice <8) return "Alto";
    if (indice <11) return "Muito Alto";
}



function iconeclima(codigo){
    if (codigo === 0) return "Assets/sol.png";
    if (codigo <= 3) return "Assets/"
    if (codigo >= 6) return "Assets/chuva.png"
}
