/**
 * Habilidades/playstyles do jogador — catálogo fixo agrupado por categoria, o
 * jogador escolhe até `MAX_SKILLS`. Descritivo (badges no perfil/card). Espelha
 * `players.catalog.ts` do backend.
 */

export const SKILL_CATALOG = {
  chute_rasteiro: "artilharia", cabeceio_preciso: "artilharia", acrobata: "artilharia",
  chute_colocado: "artilharia", cavadinha: "artilharia", pombo_sem_asas: "artilharia", bola_parada: "artilharia",
  tecnica: "controle_bola", veloz: "controle_bola", dominio: "controle_bola", malvadeza: "controle_bola", cabeca_fria: "controle_bola",
  forca_aerea: "defesa", cercar: "defesa", barreira: "defesa", interceptacao_ps: "defesa", antecipacao: "defesa", carrinho_limpo: "defesa",
  solidez: "fisico", xerife: "fisico", pe_de_vento: "fisico", incansavel: "fisico", lateral_longo: "fisico",
  sai_que_e_sua: "goleiro", arremesso_longo: "goleiro", usa_os_pes: "goleiro", saida_aerea: "goleiro", braco_elastico: "goleiro", deflector: "goleiro",
  passe_direto: "passe", passe_guiado: "passe", passe_longo: "passe", tiki_taka: "passe", passe_de_gps: "passe",
} as const;

export type SkillKey = keyof typeof SKILL_CATALOG;
export type SkillCategory = (typeof SKILL_CATALOG)[SkillKey];

export const SKILL_KEYS = Object.keys(SKILL_CATALOG) as SkillKey[];
export const SKILL_CATEGORIES = ["artilharia", "controle_bola", "defesa", "fisico", "goleiro", "passe"] as const;

export const MAX_SKILLS = 5;

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  artilharia: "Artilharia",
  controle_bola: "Controle de bola",
  defesa: "Defesa",
  fisico: "Físico",
  goleiro: "Goleiro",
  passe: "Passe",
};

export const SKILL_LABELS: Record<SkillKey, string> = {
  chute_rasteiro: "Chute rasteiro", cabeceio_preciso: "Cabeceio preciso", acrobata: "Acrobata",
  chute_colocado: "Chute colocado", cavadinha: "Cavadinha", pombo_sem_asas: "Pombo sem asas", bola_parada: "Bola parada",
  tecnica: "Técnica", veloz: "Veloz", dominio: "Domínio", malvadeza: "Malvadeza", cabeca_fria: "Cabeça fria",
  forca_aerea: "Força aérea", cercar: "Cercar", barreira: "Barreira", interceptacao_ps: "Interceptação", antecipacao: "Antecipação", carrinho_limpo: "Carrinho limpo",
  solidez: "Solidez", xerife: "Xerife", pe_de_vento: "Pé de vento", incansavel: "Incansável", lateral_longo: "Lateral longo",
  sai_que_e_sua: "Sai que é sua", arremesso_longo: "Arremesso longo", usa_os_pes: "Usa os pés", saida_aerea: "Saída aérea", braco_elastico: "Braço elástico", deflector: "Deflector",
  passe_direto: "Passe direto", passe_guiado: "Passe guiado", passe_longo: "Passe longo", tiki_taka: "Tiki-taka", passe_de_gps: "Passe de GPS",
};

export function skillLabel(key: SkillKey): string {
  return SKILL_LABELS[key];
}

/** Habilidades agrupadas por categoria (ordem de `SKILL_CATEGORIES`). */
export function skillsByCategory(): { category: SkillCategory; skills: SkillKey[] }[] {
  return SKILL_CATEGORIES.map((category) => ({
    category,
    skills: SKILL_KEYS.filter((k) => SKILL_CATALOG[k] === category),
  }));
}

function isKnownSkill(key: string): key is SkillKey {
  return key in SKILL_CATALOG;
}

/** Descarta chaves fora do catálogo (defensivo contra dados legados). */
export function toSkillList(raw: readonly string[] | null | undefined): SkillKey[] {
  if (!raw) return [];
  return raw.filter(isKnownSkill);
}

/** Compara duas listas como conjunto — habilita "Salvar" só com mudança real. */
export function skillsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((s) => setB.has(s));
}
