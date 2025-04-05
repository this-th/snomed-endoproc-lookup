// Mock data for static export
// This is used to allow the app to build for GitHub Pages
// In the real app, these would be API calls

export const mockConcept = {
  conceptId: "123456789",
  fsn: { term: "Mock Concept (finding)", lang: "en" },
  pt: { term: "Mock Concept", lang: "en" },
  active: true,
  effectiveTime: "20240101",
  moduleId: "900000000000207008",
  definitionStatus: "PRIMITIVE",
  descriptions: [],
  relationships: []
};

export const mockChildren = {
  items: [],
  limit: 50,
  offset: 0,
  total: 0
};

export const mockParents = {
  items: [],
  limit: 50,
  offset: 0,
  total: 0
}; 