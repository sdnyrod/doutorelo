import type { ConversationRoute, GeneratedAnswer, HealthTopic, IntentClassification } from './types';

const topicLabel = (topic: HealthTopic) => {
  switch (topic) {
    case 'insonia':
      return 'sono e insônia';
    case 'dor_de_cabeca':
      return 'dor de cabeça';
    case 'dor_no_peito':
      return 'dor no peito';
    case 'ansiedade_estresse':
      return 'ansiedade e estresse';
    case 'alimentacao':
      return 'digestão e alimentação';
    case 'atividade_fisica':
      return 'atividade física';
    case 'exames':
      return 'exames';
    case 'medicamentos':
      return 'medicamentos';
    default:
      return 'saúde e bem-estar';
  }
};

const stableVariant = (text: string, count: number) => {
  const sum = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.abs(sum) % count;
};

function socialFallback(originalMessage: string): GeneratedAnswer {
  const lower = originalMessage.toLowerCase();
  const period = /boa noite/.test(lower) ? 'Boa noite' : /bom dia/.test(lower) ? 'Bom dia' : /boa tarde/.test(lower) ? 'Boa tarde' : 'Olá';
  const asksCapability = /como (voce|você) pode|pode me ajudar|me ajudar|o que voce faz|o que você faz/.test(lower);
  const capabilityReplies = [
    `${period}. Posso te ajudar a transformar sintomas, rotina, exames, sono, digestão e hábitos em um mapa claro de próximos passos gerais. Traga o que mais está incomodando agora.`,
    `${period}. Me conte o que você quer entender ou melhorar: dor, energia, sono, alimentação, estresse, exames ou uma mudança recente do corpo.`,
    `${period}. Posso organizar sua dúvida em hipóteses, sinais de atenção, fatores de rotina e perguntas boas para você avançar com mais clareza. Comece pelo ponto mais importante.`,
  ];
  const warmReplies = [
    `${period}. Cheguei com você. Pode trazer o que está acontecendo no corpo, na rotina ou nos exames, e eu ajudo a organizar o caminho.`,
    `${period}. Vamos com calma e precisão. Me conte o principal incômodo ou objetivo de saúde que você quer destravar primeiro.`,
    `${period}. Estou pronto para te ajudar a enxergar padrão, contexto e próximos passos gerais. Comece por onde fizer mais sentido para você.`,
  ];
  const options = asksCapability ? capabilityReplies : warmReplies;
  return { text: options[stableVariant(originalMessage, options.length)], askedQuestions: [], claims: [] };
}

export function deterministicAnswer(params: { route: ConversationRoute; classification: IntentClassification; originalMessage: string }): GeneratedAnswer {
  const { route, classification } = params;
  const label = topicLabel(classification.topic);

  if (route.mode === 'emergency_redirect') {
    return {
      text: 'Pelo que você descreveu, existe sinal de urgência. Nesse cenário, o caminho mais seguro é procurar atendimento imediato agora ou ligar para o serviço de emergência local. Depois disso, posso ajudar a organizar o que aconteceu, horários, sintomas associados e histórico para facilitar a avaliação.',
      askedQuestions: [],
      claims: [],
    };
  }

  if (route.mode === 'social_reply') {
    return socialFallback(params.originalMessage);
  }

  if (route.mode === 'off_topic_redirect') {
    return {
      text: 'Esse tema foge do foco do DOUTORELO. Se quiser, traga isso para o corpo: sono, energia, digestão, dor, estresse, exames, alimentação, rotina ou algum sintoma específico.',
      askedQuestions: [],
      claims: [],
    };
  }

  if (route.mode === 'medication_boundary') {
    if (classification.topic === 'insonia') {
      return {
        text: 'Posso te ajudar a pensar no contexto do sono, mas não vou definir dose, produto, início, troca ou suspensão de suplemento ou medicamento. Quando a pessoa acorda no meio da noite, vale mapear hipóteses como hiperalerta e estresse, álcool à noite, cafeína acumulada, refluxo, dor, ronco ou apneia, noctúria, fome/queda de energia e horários irregulares. O passo útil é organizar horário em que desperta, tempo para voltar a dormir, uso de café/álcool/telas, ronco, refluxo, ansiedade, medicações e suplementos já usados para discutir com quem acompanha você.',
        askedQuestions: ['Você costuma acordar em qual horário e demora quanto para voltar a dormir?', 'Usa café, álcool, telas, medicamento ou suplemento no fim do dia?', 'Tem ronco, refluxo, palpitação, ansiedade, dor ou vontade de urinar à noite?'],
        claims: [],
      };
    }

    return {
      text: 'Posso te ajudar a pensar no contexto, mas não vou definir dose, início, troca ou suspensão de medicamento ou suplemento. O caminho útil aqui é organizar: nome do produto, dose atual, horário, motivo do uso, sintomas, outras medicações, histórico de alergias e objetivo do tratamento. Com isso, a decisão fica muito mais clara para quem acompanha você.',
      askedQuestions: [],
      claims: [],
    };
  }

  if (route.mode === 'clinical_boundary') {
    return {
      text: `Dá para trabalhar com hipóteses sobre ${label}, sem cravar uma certeza. O mais produtivo é cruzar padrão, tempo de evolução, intensidade, gatilhos, relação com sono, alimentação, intestino, estresse, medicamentos e sinais associados. A partir disso, geralmente já aparecem 2 ou 3 caminhos mais prováveis para investigar.` ,
      askedQuestions: ['Quando começou e como evoluiu desde então?', 'O que piora ou melhora claramente?'],
      claims: [],
    };
  }

  return {
    text: `Sobre ${label}, eu começaria procurando padrão. Em geral, os fatores mais úteis para mapear são: quando começou, intensidade, horário em que aparece, relação com refeições, sono, hidratação, café/álcool, estresse, intestino, movimento e algum gatilho repetido. Como ação inicial de baixo risco, vale anotar por 48 a 72 horas o sintoma, o que você comeu, sono, evacuação, estresse e o que melhora ou piora. Isso costuma revelar o caminho com mais rapidez do que tentar adivinhar no escuro.`,
    askedQuestions: ['Há quanto tempo isso vem acontecendo?', 'O sintoma aparece mais em algum horário ou depois de alguma refeição?', 'O que melhora ou piora claramente?'],
    claims: [],
  };
}

export function safeValidationFallback(params: { classification: IntentClassification; originalMessage: string }): GeneratedAnswer {
  const topic = params.classification.topic;

  if (params.classification.intent === 'greeting' || params.classification.intent === 'thanks' || topic === 'social') {
    return socialFallback(params.originalMessage);
  }

  if (topic === 'dor_de_cabeca') {
    return {
      text: 'Para dor de cabeça, eu pensaria primeiro em alguns grupos de hipótese: tensão muscular e bruxismo, sono ruim ou apneia, desidratação/cafeína/álcool, estresse, pressão arterial, sinusite, enxaqueca ou efeito de medicamentos. O mapa prático é observar horário da dor, local, intensidade, náusea, luz incomodando, visão alterada, pressão, sono, água, café e telas. Se for uma dor súbita muito intensa, vier com fraqueza, confusão, febre, rigidez na nuca, desmaio ou alteração visual importante, aí muda de categoria e precisa de urgência.',
      askedQuestions: ['A dor fica em que região da cabeça?', 'Ela começou de repente ou foi aumentando?', 'Tem náusea, alteração visual, febre, rigidez na nuca ou fraqueza?'],
      claims: [],
    };
  }

  if (topic === 'insonia') {
    return {
      text: 'Para sono ruim, eu investigaria quatro eixos: hiperalerta mental, ritmo circadiano bagunçado, estimulantes/álcool/telas e fatores físicos como refluxo, dor, ronco ou apneia. Como ação prática, mantenha horário fixo para acordar, pegue luz natural cedo, reduza cafeína depois do meio-dia, evite álcool como indutor de sono, faça uma desaceleração previsível à noite e anote despertares, sonhos, ronco, fome, ansiedade e energia ao acordar.',
      askedQuestions: ['Você demora para pegar no sono, acorda no meio da noite ou acorda cedo demais?', 'Usa café, álcool, telas ou treino intenso no fim do dia?', 'Acorda descansado ou já cansado?'],
      claims: [],
    };
  }

  if (topic === 'alimentacao') {
    return {
      text: 'Para desconforto digestivo, eu começaria por três trilhas: padrão alimentar, funcionamento intestinal e gatilhos de estresse. As hipóteses iniciais incluem comer rápido, excesso de gordura/álcool/café, refluxo, gastrite, constipação, intolerâncias, gases por fermentação, vesícula e piora por ansiedade. Na prática, eu cruzaria idade, peso aproximado e altura com o padrão do sintoma; coma mais devagar, observe gatilhos por alimentos específicos e registre evacuação, horário dos sintomas, relação com leite/glúten/fritura/pimenta/café, mastigação, inchaço, arrotos, azia, sono e estresse.',
      askedQuestions: ['Qual sua idade, peso aproximado e altura?', 'Tem histórico de gastrite, refluxo, vesícula, constipação, diarreia ou mudança do intestino?', 'Como estão refeições, sono, estresse e quais alimentos parecem repetir o gatilho?'],
      claims: [],
    };
  }

  return {
    text: `Sobre ${topicLabel(topic)}, o melhor ponto de partida é transformar a queixa em padrão observável: início, frequência, intensidade, horário, gatilhos, sono, alimentação, intestino, estresse, movimento e fatores que aliviam. A partir desse mapa dá para levantar hipóteses mais úteis e escolher próximos passos gerais sem cair em chute.`,
    askedQuestions: ['Quando começou?', 'O que piora ou melhora?', 'Que mudança de rotina aconteceu perto do início?'],
    claims: [],
  };
}
