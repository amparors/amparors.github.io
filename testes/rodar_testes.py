"""Roda os testes automáticos do Amparo RS num Chrome invisível.

Uso:
  python testes/rodar_testes.py          testa os arquivos desta pasta (antes de publicar)
  python testes/rodar_testes.py --site   testa o site publicado (https://amparors.github.io)

Mostra cada teste com ✅ ou ❌ e termina com código 0 (tudo certo) ou 1 (algo falhou).
"""
import functools
import http.server
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse
import urllib.request

PASTA_DO_APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_PUBLICADO = 'https://amparors.github.io'
TEMPO_MAXIMO = 300  # segundos


def porta_livre():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def achar_chrome():
    candidatos = [
        os.environ.get('CHROME', ''),
        shutil.which('google-chrome') or '',
        shutil.which('google-chrome-stable') or '',
        shutil.which('chromium') or '',
        shutil.which('chromium-browser') or '',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ]
    for c in candidatos:
        if c and os.path.exists(c):
            return c
    sys.exit('Não encontrei o Google Chrome. Instale-o ou indique o caminho na variável CHROME.')


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, *args):
        pass


def ligar_servidor_local():
    porta = porta_livre()
    atendente = functools.partial(SemCache, directory=PASTA_DO_APP)
    servidor = http.server.ThreadingHTTPServer(('127.0.0.1', porta), atendente)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor, f'http://127.0.0.1:{porta}'


def ler_resultado(porta_depuracao):
    """O testes.html escreve o resultado no título da página; o Chrome mostra o título em /json."""
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{porta_depuracao}/json', timeout=3) as r:
            paginas = json.load(r)
    except OSError:
        return None
    for p in paginas:
        titulo = p.get('title', '')
        if p.get('type') == 'page' and titulo.startswith('RESULTADO '):
            return json.loads(urllib.parse.unquote(titulo[len('RESULTADO '):]))
    return None


def main():
    no_site = '--site' in sys.argv
    servidor = None
    if no_site:
        endereco = SITE_PUBLICADO
    else:
        servidor, endereco = ligar_servidor_local()
    pagina = f'{endereco}/testes/testes.html?t={int(time.time())}'
    print(f'Testando {endereco} …', flush=True)

    perfil = tempfile.mkdtemp(prefix='amparo-testes-')
    porta_depuracao = porta_livre()
    comando = [
        achar_chrome(), '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        f'--user-data-dir={perfil}', f'--remote-debugging-port={porta_depuracao}', pagina,
    ]
    if sys.platform.startswith('linux') and os.environ.get('CI'):
        comando.insert(1, '--no-sandbox')
    chrome = subprocess.Popen(comando, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    resultado = None
    try:
        limite = time.time() + TEMPO_MAXIMO
        while time.time() < limite and resultado is None:
            time.sleep(1)
            resultado = ler_resultado(porta_depuracao)
    finally:
        # Fecha só o Chrome que este script abriu
        chrome.terminate()
        try:
            chrome.wait(timeout=10)
        except subprocess.TimeoutExpired:
            chrome.kill()
        shutil.rmtree(perfil, ignore_errors=True)
        if servidor:
            servidor.shutdown()

    if resultado is None:
        print('❌ Os testes não terminaram a tempo.')
        sys.exit(1)

    for r in resultado['resultados']:
        detalhe = f" — {r['detalhe']}" if r['detalhe'] else ''
        print(f"{'✅' if r['ok'] else '❌'} {r['nome']}{detalhe}")
    total = len(resultado['resultados'])
    falhas = resultado['falhas']
    print(f'\n{total - falhas} de {total} testes passaram.')
    sys.exit(1 if falhas else 0)


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
