# Registro de inspeção da logo transparente

A primeira tentativa generativa removeu o fundo, mas alterou visualmente a composição e gerou risco de artefatos, portanto não deve ser usada como asset final do site.

A segunda abordagem determinística partiu do arquivo oficial `/home/ubuntu/webdev-static-assets/doutorelo-logo-oficial-web.png`, removeu apenas o fundo branco conectado às bordas e preservou a marca, gerando `/home/ubuntu/webdev-static-assets/doutorelo-logo-oficial-transparente-clean.png` em PNG RGBA com `alpha_extrema=(0, 255)`. O arquivo resultante deve ser usado como base para a versão web transparente, desde que o teste visual na página confirme ausência de retângulo branco.
