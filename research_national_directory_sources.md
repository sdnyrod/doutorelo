# Achados iniciais sobre fontes para população real do Diretório Nacional

## CNES via DATASUS/PySUS

A documentação do PySUS informa que o CNES é o **Cadastro Nacional de Estabelecimentos de Saúde** e descreve o cadastro como fonte oficial do Ministério da Saúde sobre capacidade instalada e mão de obra assistencial em estabelecimentos públicos e privados, com ou sem convênio SUS. A mesma documentação mostra acesso estruturado aos diretórios do FTP do DATASUS, evitando scraping de páginas interativas.

A fonte lista grupos de arquivos CNES, incluindo `PF` para **Profissional** e `ST` para **Estabelecimentos**. Também descreve filtros por UF, ano e mês, e download de arquivos `.dbc` convertidos para parquet por PySUS. Isso torna o CNES uma fonte candidata para ingestão piloto controlada, com rastro de origem e competência mensal.

URL verificada: https://pysus.readthedocs.io/pt/latest/databases/CNES.html

## Diretriz operacional preliminar

A ingestão piloto deve priorizar arquivos estruturados do CNES, em vez de scraping de sites, redes sociais ou páginas com mecanismos interativos. A primeira execução deve ser limitada por UF, mês e CBO de médico, registrando fonte, competência, arquivo original, contagens e eventuais erros.

## CFM — Webservice de listagem de médicos

A página oficial do CFM descreve um **webservice de listagem de médicos** normatizado pela Resolução CFM nº 2.309/2022. Os dados acessíveis são: nome completo, número do registro no CRM, estado do registro, tipo de inscrição, situação da inscrição e especialidade registrada, com atualização diária.

A própria página informa que, em nenhuma hipótese, o serviço fornece CPF, endereço, telefone ou e-mail. O acesso exige contratação/solicitação formal: empresas particulares pagam valor anual e entidades públicas podem ter gratuidade. A página também informa que o acesso deve ser feito diretamente pelo usuário final, não por empresa intermediária.

URL verificada: https://sistemas.cfm.org.br/listamedicos/informacoes

## Decisão preliminar de governança

Para execução imediata dentro do projeto, o CFM não deve ser raspado. A integração correta depende de contratação/chave formal. Portanto, a fonte piloto mais adequada para iniciar agora é o CNES/DATASUS por arquivos estruturados oficiais, com recorte limitado e auditável. O CFM pode ficar registrado como fonte futura mediante credenciamento formal.
