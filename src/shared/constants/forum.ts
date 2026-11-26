import type { ForumCategory, ForumTopic } from '../types'

export const FORUM_STORAGE_KEY = 'horta-comunitaria:forum:v1'

export const FORUM_CATEGORIES: ForumCategory[] = [
  'Comunicados',
  'Mutirões',
  'Dúvidas',
  'Plantio e manejo',
]

export const INITIAL_FORUM_TOPICS: ForumTopic[] = [
  {
    id: 1,
    title: 'Mutirão de limpeza e preparo dos canteiros',
    category: 'Mutirões',
    message:
      'Pessoal, neste sábado vamos nos reunir às 8h para limpar os canteiros do Setor B e preparar a área para o próximo plantio. Levem luvas e, se possível, ferramentas de capina.',
    author: 'Ana Beatriz Costa',
    createdAt: '2026-11-20T09:00:00.000Z',
    replies: [
      {
        id: 1,
        topicId: 1,
        author: 'Carlos Eduardo Lima',
        message: 'Posso chegar às 8h e levar duas enxadas extras.',
        createdAt: '2026-11-20T10:15:00.000Z',
      },
      {
        id: 2,
        topicId: 1,
        author: 'Mariana Alves',
        message: 'Vou levar mudas de alface para aproveitarmos o espaço preparado.',
        createdAt: '2026-11-21T08:40:00.000Z',
      },
    ],
  },
  {
    id: 2,
    title: 'Dúvida sobre adubação orgânica no Canteiro 3',
    category: 'Dúvidas',
    message:
      'O Canteiro 3 está em preparo. Podemos usar o composto do Setor C ou é melhor esperar mais algumas semanas de maturação?',
    author: 'Carlos Eduardo Lima',
    createdAt: '2026-11-22T14:30:00.000Z',
    replies: [
      {
        id: 3,
        topicId: 2,
        author: 'Ana Beatriz Costa',
        message:
          'Podemos usar uma camada fina do composto mais antigo. O material mais recente ainda precisa de mais tempo.',
        createdAt: '2026-11-22T16:05:00.000Z',
      },
    ],
  },
  {
    id: 3,
    title: 'Comunicado: nova escala de rega',
    category: 'Comunicados',
    message:
      'A escala de rega da semana que vem já está no quadro da horta. Quem puder cobrir a manhã de quinta-feira, por favor avise por aqui.',
    author: 'Ana Beatriz Costa',
    createdAt: '2026-11-24T07:45:00.000Z',
    replies: [],
  },
]
