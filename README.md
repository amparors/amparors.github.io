# Amparo RS

Aplicativo (site para celular) que ajuda idosos, principalmente os que vivem sozinhos, a viver com mais segurança.
Abre direto, sem login e sem senha.

👉 **Acesse: https://amparors.github.io**

No celular, abra o link no Chrome e toque em **"Adicionar à tela inicial"** para ele virar um ícone como um aplicativo.

## Telas

| Tela | O que tem |
|---|---|
| 🚨 **Emergência** | Polícia 190, Ambulância/SAMU 192, Bombeiros 193, Defesa Civil 199, com desenhos e números grandes. Também CVV 188 (conversar) e Disque 100 (maus-tratos). Toque para ligar. |
| 🌳 **Lazer** | Grupos de idosos, praças e parques, exercícios e esporte, cultura e leitura. Ao tocar, **o Google Maps abre direto** com esses lugares perto da pessoa. |
| 🏥 **Ajuda** | Hospitais, postos de saúde, farmácias, delegacias, assistência social (CRAS), casas de acolhimento. Ao tocar, **o Google Maps abre direto**. Nos de urgência a busca já pede **só os abertos agora**. |
| 🎤 **Falar** | Botão amarelo em todas as telas: a pessoa **fala** (ou escreve) o que precisa, por exemplo "estou passando mal" ou "quero uma farmácia", e o app mostra o que fazer e responde em voz alta. |

No topo, o botão **🔊 Ouvir** lê a tela em voz alta, com uma **voz mansa e serena** (mais devagar e num tom mais baixo).
**Nada precisa ser rolado:** cada tela ocupa exatamente a altura do celular, e os cartões e as letras
crescem ou diminuem para caber (em pé ou deitado, do celular pequeno ao computador).
Os números de emergência funcionam mesmo sem internet depois da primeira visita.

Visual: identidade da logo Amparo RS (azul-marinho #07306E, amarelo #FCD657, fundo creme #FFF7E2) e fonte Nunito.
A logo fica em `img/` (símbolo, nome e logo completa) e os ícones do app em `icons/`.
As cores dos cartões de emergência (vermelho, laranja, amarelo) e o verde de "Ligar" foram mantidos para facilitar o reconhecimento.

## Como testar no computador e no celular

1. Abra um terminal nesta pasta e rode:

   ```bash
   python servidor.py
   ```

2. No computador, abra <http://localhost:8000>.
   Para ver como fica no celular: aperte **F12** e depois **Ctrl+Shift+M**.
3. No celular (ligado no **mesmo Wi-Fi**), abra o endereço `https://...:8443` que aparece no terminal.
   O celular vai avisar que a conexão não é particular: toque em **Avançado** e depois em **Continuar**.
   Isso é normal no teste local e libera a localização e o microfone.

## Arquivos

- `index.html`: estrutura das telas
- `style.css`: visual (cores, tamanhos, celular)
- `app.js`: funcionamento (ligações, Google Maps, voz, chat)
- `sw.js`: guarda o app para abrir sem internet
- `manifest.webmanifest` e `icons/`: nome e ícone para "instalar" na tela do celular
- `img/`: logo Amparo RS
- `fonts/`: fonte Nunito (licença livre OFL, em `fonts/OFL.txt`)
- `servidor.py`: liga o app para testar no computador e no celular
- `.nojekyll`: avisa o GitHub Pages para publicar os arquivos como estão

## Publicação

O site é publicado de graça pelo **GitHub Pages**, direto deste repositório (ramo `main`).
Tudo o que o app precisa está aqui dentro: não depende de nenhum computador ligado.
Para atualizar o site, basta enviar as mudanças para o GitHub; em 1 ou 2 minutos o link mostra a versão nova.

## De onde vêm os dados

- Lugares: o Google Maps, aberto direto com a busca pronta (ex.: "farmácia aberta agora perto de mim"). Não precisa de chave, conta nem custo.
- Futuro (opcional): mostrar a lista do Google dentro do app. Para isso é preciso uma chave do Google Cloud, com cartão cadastrado e uma cota grátis por mês.
- Reconhecimento de voz e leitura em voz alta: do próprio navegador do celular (Chrome no Android funciona melhor).
