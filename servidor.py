"""Liga o Amparo RS para testar no computador e no celular (mesma rede Wi-Fi).

Uso:  python servidor.py

- http://ENDERECO:8000   abre rápido, mas o celular bloqueia localização e microfone
- https://ENDERECO:8443  libera localização e microfone (o celular mostra um aviso
                          de segurança: toque em "Avançado" e depois em "Continuar")
"""
import datetime
import http.server
import ipaddress
import os
import socket
import ssl
import threading
from functools import partial

PASTA = os.path.dirname(os.path.abspath(__file__))
PASTA_CERTIFICADO = os.path.join(PASTA, '.certificado')
PORTA_HTTP = 8000
PORTA_HTTPS = 8443


def ip_da_rede():
    """Descobre o endereço deste computador na rede (não envia nada pela internet)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        s.close()


def preparar_certificado(ip):
    """Cria um certificado de teste para o https funcionar na rede local."""
    certificado = os.path.join(PASTA_CERTIFICADO, 'certificado.pem')
    chave = os.path.join(PASTA_CERTIFICADO, 'chave.pem')
    marcador = os.path.join(PASTA_CERTIFICADO, 'ip.txt')
    if os.path.exists(certificado) and os.path.exists(marcador):
        with open(marcador, encoding='utf-8') as f:
            if f.read().strip() == ip:
                return certificado, chave

    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID

    os.makedirs(PASTA_CERTIFICADO, exist_ok=True)
    chave_privada = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    nome = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Amparo RS - teste local')])
    agora = datetime.datetime.now(datetime.timezone.utc)
    cert = (
        x509.CertificateBuilder()
        .subject_name(nome)
        .issuer_name(nome)
        .public_key(chave_privada.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(agora - datetime.timedelta(days=1))
        .not_valid_after(agora + datetime.timedelta(days=365))
        .add_extension(x509.SubjectAlternativeName([
            x509.DNSName('localhost'),
            x509.IPAddress(ipaddress.ip_address('127.0.0.1')),
            x509.IPAddress(ipaddress.ip_address(ip)),
        ]), critical=False)
        .sign(chave_privada, hashes.SHA256())
    )
    with open(chave, 'wb') as f:
        f.write(chave_privada.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.TraditionalOpenSSL,
            serialization.NoEncryption(),
        ))
    with open(certificado, 'wb') as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    with open(marcador, 'w', encoding='utf-8') as f:
        f.write(ip)
    return certificado, chave


class SemCache(http.server.SimpleHTTPRequestHandler):
    """Sempre entrega a versão mais nova dos arquivos (bom para testar)."""

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, *args):
        pass


def main():
    ip = ip_da_rede()
    atendente = partial(SemCache, directory=PASTA)

    servidor_https = http.server.ThreadingHTTPServer(('0.0.0.0', PORTA_HTTPS), atendente)
    contexto = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    contexto.load_cert_chain(*preparar_certificado(ip))
    servidor_https.socket = contexto.wrap_socket(servidor_https.socket, server_side=True)
    threading.Thread(target=servidor_https.serve_forever, daemon=True).start()

    servidor_http = http.server.ThreadingHTTPServer(('0.0.0.0', PORTA_HTTP), atendente)

    print('Amparo RS ligado!')
    print(f'  No computador:  http://localhost:{PORTA_HTTP}')
    print(f'  No celular:     https://{ip}:{PORTA_HTTPS}   (com localização e microfone)')
    print(f'                  http://{ip}:{PORTA_HTTP}    (sem localização e microfone)')
    print('Para desligar, feche esta janela ou aperte Ctrl+C.', flush=True)
    try:
        servidor_http.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
