export interface Concept {
  conceptId: string;
  active: boolean;
  definitionStatus: string;
  moduleId: string;
  effectiveTime: string;
  fsn: {
    term: string;
    lang: string;
  };
  pt: {
    term: string;
    lang: string;
  };
  id: string;
  idAndFsnTerm: string;
}

export interface ConceptDescription {
  descriptionId: string;
  conceptId: string;
  active: boolean;
  term: string;
  type: "SYNONYM" | "FSN" | string;
  lang: string;
  moduleId: string;
  effectiveTime: string;
  acceptabilityMap?: Record<string, string>;
  caseSignificance?: string;
  released?: boolean;
  releasedEffectiveTime?: number;
  typeId?: string;
}

export interface ConceptDetail {
  conceptId: string;
  active: boolean;
  definitionStatus: string;
  moduleId: string;
  effectiveTime: string;
  fsn: {
    term: string;
    lang: string;
  };
  pt: {
    term: string;
    lang: string;
  };
  descendantCount: number;
  statedDescendantCount: number;
  synonyms: Array<{
    term: string;
    acceptabilityMap: Record<string, string>;
    lang: string;
  }>;
  classAxioms: Array<Record<string, unknown>>;
  gciAxioms: Array<Record<string, unknown>>;
  relationships: Array<Record<string, unknown>>;
  statedRelationships: Array<Record<string, unknown>>;
  descriptions: Array<Record<string, string>>;
  ancestors: Array<Record<string, unknown>>;
}

export interface SearchParams {
  term: string;
  organSystem: string;
  procedureMethod: string;
}

export interface SearchResponse {
  items: Concept[];
  total: number;
  limit: number;
  offset: number;
} 