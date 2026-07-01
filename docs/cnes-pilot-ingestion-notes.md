# Notas técnicas da ingestão piloto CNES/PF

A inspeção controlada usou a biblioteca PySUS 2.0.1 apenas para leitura de metadados e conversão de arquivo oficial CNES, sem gravação no banco de dados. A fonte é o catálogo público CNES/DATASUS exposto pelo PySUS, com arquivos por UF, competência e grupo.

## Resultado da inspeção inicial

| Item | Valor observado |
|---|---|
| Dataset | CNES |
| UF piloto | AC |
| Competência mais recente disponível na inspeção | 2025-12 |
| Arquivo PF | `PFAC2512.parquet` |
| Caminho de origem no catálogo | `public/data/ftp/cnes/PFAC2512.parquet` |
| Dimensão PF AC 2025-12 | 34.774 linhas e 362 colunas |
| Grupos CNES listados para AC | DC, EF, EP, EQ, GM, HB, IN, LT, PF, RC, SR, ST |

## Campos PF relevantes para médicos/profissionais

Os campos observados no grupo PF incluem, entre outros: `CNES`, `CODUFMUN`, `CPF_PROF`, `CPFUNICO`, `CBO`, `CBOUNICO`, `NOMEPROF`, `CNS_PROF`, `CONSELHO`, `REGISTRO`, `VINCULAC`, `VINCUL_C`, `VINCUL_A`, `VINCUL_N`, `PROF_SUS`, `PROFNSUS`, `HORAOUTR`, `HORAHOSP`, `HORA_AMB`, `UFMUNRES` e `COMPETEN`.

## Decisões de compliance para a ingestão

O pipeline deve persistir apenas o mínimo necessário para descoberta pública e auditoria: nome profissional, CBO/especialidade, conselho/registro quando disponível, CNES, município/UF, competência, fonte, evidência e score de qualidade. Identificadores pessoais sensíveis ou desnecessários, como CPF e CNS, não devem ser persistidos; se precisarem existir em evidência técnica, devem ser omitidos ou mascarados de forma irreversível no snapshot público/operacional.

## Limite operacional recomendado

A execução inicial deve ser restrita por UF, competência e limite de registros, com modo `dryRun` por padrão. A gravação real deve ser acionada apenas por procedimento administrativo ou script operacional explicitamente autorizado, registrando job de ingestão, contadores, erros e cobertura territorial.
