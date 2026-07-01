# Decisão arquitetural: localização e busca de profissionais

O fluxo público do chat é tratado como missão crítica. A consulta por profissionais da Rede Dayan não pode depender de nomes de municípios hardcoded no código de decisão, em prompts de roteamento, em fallbacks ou em listas auxiliares de extração. O nome de uma cidade deve aparecer no runtime apenas como dado recebido do usuário, como coordenada/geolocalização resolvida, ou como dado cadastrado na base de profissionais.

A arquitetura correta é composta por três etapas independentes. Primeiro, a mensagem do usuário é interpretada para preencher variáveis de localização, como `city`, `state`, `lat` e `lng`, sem listas fixas de municípios. Segundo, essas variáveis são usadas para consultar e ranquear a base de profissionais, que é a fonte de verdade de cobertura geográfica. Terceiro, quando não houver profissional compatível com a cidade/UF solicitada, o chat deve responder de forma honesta, sem promover outra cidade como sugestão principal.

| Princípio | Regra operacional |
|---|---|
| Cidade não é regra de código | Nenhum município pode aparecer como condição de roteamento, fallback ou extração no chat. |
| Banco é fonte de verdade | Profissionais e suas cidades vêm da tabela/base de profissionais, não de listas no roteador. |
| Testes provam invariantes | Testes podem usar cidades como fixtures, mas devem demonstrar a regra geral e não validar exceções manuais. |
| Sem falso positivo local | Se o usuário pede uma cidade específica e não há profissional local, o sistema não deve preencher com outra cidade como se fosse resposta local. |
| Escala nacional | A mesma lógica precisa funcionar para três, cinco mil ou cem mil localidades, desde que os dados estejam cadastrados. |
