"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Concept, ConceptDetail as ConceptDetailType } from "../lib/types";
import { getConceptParents, getConceptChildren } from "../lib/api";
import { InfoIcon, ExternalLink, ChevronRight, Info } from "lucide-react";

// Define the Mapping type
interface Mapping {
  targetComponentId: string;
  targetDisplay: string;
  mapTarget?: string;
}

// Define the Relationship type
interface Relationship {
  relationshipId: string;
  active: boolean;
  typeId: string;
  type: {
    pt: {
      term: string;
    };
  };
  target: {
    pt: {
      term: string;
    };
  };
  characteristicType: string;
  groupId: number;
}

interface ConceptDetailProps {
  conceptDetail: ConceptDetailType | null;
  isLoading: boolean;
}

export default function ConceptDetail({ conceptDetail, isLoading }: ConceptDetailProps) {
  // State for parents and children
  const [parents, setParents] = useState<Concept[]>([]);
  const [children, setChildren] = useState<Concept[]>([]);
  
  // State for loading states
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  
  // State for counting parent and child relationships
  const [childRelationships, setChildRelationships] = useState(0);

  // Extract active synonyms from descriptions array
  const activeSynonyms = useMemo(() => {
    if (!conceptDetail || !conceptDetail.descriptions) return [];
    
    return (conceptDetail.descriptions as unknown as Array<{
      active: boolean;
      type: string;
      term: string;
    }>)
      .filter(desc => desc.active && desc.type === "SYNONYM")
      .map(desc => desc.term);
  }, [conceptDetail]);

  // Extract parent relationships
  const parentRelationships = useMemo(() => {
    if (!conceptDetail?.relationships) return [];
    
    return (conceptDetail.relationships
      .filter(r => r.active && r.typeId === "116680003" && r.characteristicType === "INFERRED_RELATIONSHIP") as unknown) as Relationship[];
  }, [conceptDetail]);

  // Extract attribute relationships
  const attributeRelationships = useMemo(() => {
    if (!conceptDetail?.relationships) return [];
    
    return (conceptDetail.relationships
      .filter(r => r.active && r.typeId !== "116680003" && r.characteristicType === "INFERRED_RELATIONSHIP") as unknown) as Relationship[];
  }, [conceptDetail]);

  // Group attribute relationships by groupId
  const groupedAttributes = useMemo(() => {
    if (!attributeRelationships.length) return {};
    
    const result: Record<number, Relationship[]> = {};
    
    attributeRelationships.forEach(rel => {
      const groupId = rel.groupId || 0;
      if (!result[groupId]) {
        result[groupId] = [];
      }
      result[groupId].push(rel);
    });
    
    return result;
  }, [attributeRelationships]);

  // Fetch parents and children when concept details change
  useEffect(() => {
    if (!conceptDetail) {
      setParents([]);
      setChildren([]);
      return;
    }

    // Fetch parents
    const fetchParents = async () => {
      setIsLoadingParents(true);
      try {
        const parentData = await getConceptParents(conceptDetail.conceptId);
        setParents(parentData);
      } catch (error) {
        console.error("Error fetching parents:", error);
        setParents([]);
      } finally {
        setIsLoadingParents(false);
      }
    };

    // Fetch children
    const fetchChildren = async () => {
      setIsLoadingChildren(true);
      try {
        const childrenData = await getConceptChildren(conceptDetail.conceptId);
        setChildren(childrenData);
      } catch (error) {
        console.error("Error fetching children:", error);
        setChildren([]);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchParents();
    fetchChildren();
  }, [conceptDetail]);

  // Extract parent relationships
  const parentIds = parents.map(parent => parent.conceptId);
  
  // Initialize empty arrays for storing ICD-10 and LOINC mappings
  const icd10Mappings: Mapping[] = [];
  const loincMappings: Mapping[] = [];

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  if (!conceptDetail) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          <InfoIcon className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Select a concept to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[400px] h-auto lg:border-none md:shadow-none lg:shadow border-primary/20 md:border-primary/10 lg:border-none">
      <CardHeader className="sticky top-0 bg-card z-10">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          SCTID: {conceptDetail.conceptId}
          <a 
            href={`https://browser.ihtsdotools.org/?perspective=full&conceptId1=${conceptDetail.conceptId}&edition=MAIN`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors relative group"
          >
            <ExternalLink className="h-4 w-4" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
              View in SNOMED CT browser
            </div>
          </a>
        </div>
        <CardTitle>{conceptDetail.fsn.term}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="synonyms">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="synonyms">Synonyms</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="synonyms" className="space-y-4">
            {activeSynonyms.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {activeSynonyms.map((synonym) => (
                  <li key={synonym} className="text-sm">
                    {synonym}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No synonyms available</div>
            )}
          </TabsContent>
          
          <TabsContent value="hierarchy" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Parents</h4>
              {isLoadingParents ? (
                <div className="text-sm text-muted-foreground">Loading parents...</div>
              ) : parents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {parents.map((parent) => (
                        <tr key={parent.conceptId} className="border-b border-muted">
                          <td className="p-2 font-mono text-xs w-28">{parent.conceptId}</td>
                          <td className="p-2 text-sm">{parent.fsn.term}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No parents available</div>
              )}
            </div>
            
            <div className="mt-8">
              <h4 className="text-sm font-medium mb-2">Children</h4>
              {isLoadingChildren ? (
                <div className="text-sm text-muted-foreground">Loading children...</div>
              ) : children.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {children.map((child) => (
                        <tr key={child.conceptId} className="border-b border-muted">
                          <td className="p-2 font-mono text-xs w-28">{child.conceptId}</td>
                          <td className="p-2 text-sm">{child.fsn.term}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No children available
                  {conceptDetail.descendantCount ? ` (Has ${conceptDetail.descendantCount} descendants in total)` : ""}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="attributes" className="space-y-4">
            {attributeRelationships.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedAttributes).map(([groupId, relations]) => (
                  <div key={groupId} className="border rounded-md p-3">
                    <div className="text-sm font-medium mb-2">
                      {groupId === "0" ? "Ungrouped Attributes" : `Attribute Group ${groupId}`}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {relations.map((rel) => (
                            <tr key={rel.relationshipId} className="border-b border-muted">
                              <td className="p-2 text-sm font-medium w-1/3">{rel.type?.pt?.term || "Unknown type"}</td>
                              <td className="p-2 text-sm w-2/3">{rel.target?.pt?.term || "Unknown value"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No attributes available</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoadingPlaceholder() {
  return (
    <Card className="min-h-[400px] h-auto">
      <CardHeader>
        <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/2 mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
} 