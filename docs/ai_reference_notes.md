# Notas de referência para IA clínica governada

A arquitetura de IA do projeto deve se orientar por governança de risco, validação contínua e limites clínicos explícitos. O NIST AI RMF 1.0 é descrito pelo NIST como um framework voluntário para melhorar a incorporação de considerações de confiabilidade no desenho, desenvolvimento, uso e avaliação de produtos, serviços e sistemas de IA. A página também referencia o perfil de IA generativa NIST AI 600-1, publicado em 2024, como apoio para identificar riscos específicos de IA generativa e ações de gerenciamento.

A FDA, em página sobre Good Machine Learning Practice for Medical Device Development, afirma que IA e ML podem transformar a saúde ao extrair insights de dados de cuidado, mas apresentam considerações únicas por sua complexidade e natureza iterativa/data-driven. A página indica que os princípios de GMLP buscam promover dispositivos de IA/ML seguros, efetivos e de alta qualidade, considerando o ciclo de vida total do produto.

Implicação direta para o projeto: a IA deve ser tratada como sistema clínico-assistivo governado, não como resposta livre. O princípio central será “responder com segurança ou não responder”: declarar incerteza, não inventar, solicitar contexto adicional, acionar fallback determinístico e escalar para humano quando houver risco, baixa confiança ou falta de base suficiente.

Referências:

[1]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"
[2]: https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles "Good Machine Learning Practice for Medical Device Development: Guiding Principles | FDA"

Tentativa adicional: a página pública da OMS sobre orientação de ética e governança para grandes modelos multimodais em saúde retornou erro 502 durante a navegação. Como a busca indicou o título e a existência da orientação, mas o conteúdo não foi acessível diretamente nesta tentativa, ela não será usada como base factual principal até nova validação. O documento de arquitetura deve se apoiar, por ora, nas referências acessadas do NIST e da FDA.
