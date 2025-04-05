import { Concept, ConceptDetail, SearchParams, SearchResponse } from "./types";
import { API_BASE, BRANCH } from "../config/api";

// API constants
// Static part of the ECL query
const STATIC_ECL = "(< 71388002: << 405815000 = << 105794008, [1..*] << 363704007 = *)";

// Concept IDs for organ systems and procedure methods
const ORGAN_SYSTEM_IDS: Record<string, string> = {
  brainAndSpinal: "(<< 783207002 OR << 389079005)",
  nerves: "<< 3057000",
  endocrineGlands: "<< 387910009",
  eye: "<< 371398005",
  earNoseThroat: "<< 385383008",
  lowerRespiratoryTract: "<< 400141005",
  heartAndPericardium: "<< 409708007",
  bloodVessels: "<< 59820001",
  lymphaticSystem: "<< 89890002",
  upperGi: "<< 62834003",
  lowerGi: "<< 5668004",
  rectumAndAnus: "<< 281088000",
  liverAndBiliary: "<< 303270005",
  pancreas: "<< 15776009",
  kidneyAndUreter: "<< 304582006",
  bladderAndUrethra: "<< 19787009",
  maleGenitalOrgans: "<< 699882006",
  femaleGenitalOrgans: "<< 699879001",
  bonesAndJoints: "<< 306721000",
  skeletalMuscle: "<< 79984008",
  skin: "<< 48075008",
  breast: "<< 76752008",
};

const PROCEDURE_METHOD_IDS: Record<string, string> = {
  biopsy: "<< 129314006",
  destruction: "<< 129382001",
  examination: "<< 302199004",
  imaging: "<< 360037004",
  fixation: "<< 129371009",
  introduction: "<< 129325002",
  opening: "<< 312336005",
  removal: "<< 129303008",
  repair: "<< 257903006",
  replacement: "<< 282089006",
  structuralModification: "<< 303894001"
};

/**
 * Search for concepts based on the provided search parameters
 */
export async function searchConcepts({ 
  term, 
  organSystem, 
  procedureMethod 
}: SearchParams, offset = 0, limit = 20): Promise<SearchResponse> {
  try {
    // Build the endpoint URL for the Snowstorm API - correct structure without browser
    const baseUrl = `${API_BASE}/${BRANCH}/concepts`;
    
    // Build the ECL query - starting with the static part
    let ecl = STATIC_ECL;
    
    // Create an array to hold our filter conditions
    const conditions = [];
    
    // Add organ system filter if provided
    if (organSystem && ORGAN_SYSTEM_IDS[organSystem]) {
      const organSystemId = ORGAN_SYSTEM_IDS[organSystem];
      // Use the correct syntax for organ system filter with parentheses
      conditions.push(`(<< 71388002: << 363704007 = ${organSystemId})`);
    }
    
    // Add procedure method filter if provided
    if (procedureMethod && PROCEDURE_METHOD_IDS[procedureMethod]) {
      const procedureMethodId = PROCEDURE_METHOD_IDS[procedureMethod];
      // Use the correct syntax for procedure method with parentheses
      conditions.push(`(<< 71388002: << 260686004 = ${procedureMethodId})`);
    }
    
    // If we have additional conditions, add them to the base ECL
    if (conditions.length > 0) {
      // Join conditions with AND but don't use nested parentheses which can cause syntax errors
      ecl = `${ecl} AND ${conditions.join(" AND ")}`;
    }
    
    // Build the request URL with correct parameters
    // We'll use a URLSearchParams object for proper encoding
    const params = new URLSearchParams();
    
    // Add the standard parameters as shown in the correct URL
    if (term) params.append("term", term);
    params.append("offset", offset.toString());
    params.append("limit", limit.toString());
    params.append("includeLeafFlag", "false");
    params.append("form", "inferred");
    
    // For ECL, we need to ensure it's properly encoded
    params.append("ecl", ecl);
    
    // Build the full URL
    const fullUrl = `${baseUrl}?${params.toString()}`;
    
    // Enhanced logging for debugging ECL queries
    console.log("====== SEARCH PARAMETERS ======");
    console.log("Term:", term || "None");
    console.log("Organ System:", organSystem || "None", organSystem ? `(ID: ${ORGAN_SYSTEM_IDS[organSystem]})` : "");
    console.log("Procedure Method:", procedureMethod || "None", procedureMethod ? `(ID: ${PROCEDURE_METHOD_IDS[procedureMethod]})` : "");
    console.log("====== ECL QUERY ======");
    console.log(ecl);
    console.log("====== FULL URL ======");
    console.log(fullUrl);
    console.log("===========================");
    
    // Make actual API request
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      // Try to parse the error response
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage = `${errorMessage}: ${errorData.message}`;
        }
      } catch (error) {
        // If we can't parse the JSON, just use the status
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching concepts:", error);
    return { 
      items: [], 
      limit, 
      offset, 
      total: 0 
    };
  }
}

/**
 * Get detailed information about a specific concept
 */
export async function getConceptDetails(conceptId: string): Promise<ConceptDetail | null> {
  try {
    // Build the endpoint URL with proper structure - use browser path for detail endpoints
    const endpoint = `${API_BASE}/browser/${BRANCH}/concepts/${conceptId}?descendantCountForm=inferred`;
    console.log("API endpoint for details:", endpoint);
    
    // Make actual API request
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      // Try to parse the error response
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage = `${errorMessage}: ${errorData.message}`;
        }
      } catch (error) {
        // If we can't parse the JSON, just use the status
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching concept details:", error);
    return null;
  }
}

/**
 * Get parent concepts for the specified concept
 */
export async function getConceptParents(conceptId: string): Promise<Concept[]> {
  try {
    // Build the endpoint URL with proper structure - use browser path for parent endpoints
    const endpoint = `${API_BASE}/browser/${BRANCH}/concepts/${conceptId}/parents?form=inferred`;
    console.log("API endpoint for parents:", endpoint);
    
    // Make actual API request
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      // Try to parse the error response
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage = `${errorMessage}: ${errorData.message}`;
        }
      } catch (error) {
        // If we can't parse the JSON, just use the status
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching concept parents:", error);
    return [];
  }
}

/**
 * Get child concepts for the specified concept
 */
export async function getConceptChildren(conceptId: string): Promise<Concept[]> {
  try {
    // Build the endpoint URL with proper structure - use browser path for children endpoints
    const endpoint = `${API_BASE}/browser/${BRANCH}/concepts/${conceptId}/children?form=inferred`;
    console.log("API endpoint for children:", endpoint);
    
    // Make actual API request
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      // Try to parse the error response
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage = `${errorMessage}: ${errorData.message}`;
        }
      } catch (error) {
        // If we can't parse the JSON, just use the status
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching concept children:", error);
    return [];
  }
} 