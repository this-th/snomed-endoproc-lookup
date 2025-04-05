"use client";

import { Button } from "@/components/ui/button";
import { Concept } from "../lib/types";
import { Loader2 } from "lucide-react";

interface ResultsListProps {
  results: Concept[];
  total: number;
  onLoadMore: () => void;
  onSelectConcept: (concept: Concept) => void;
  selectedConceptId?: string;
  isLoading: boolean;
}

export default function ResultsList({
  results,
  total,
  onLoadMore,
  onSelectConcept,
  selectedConceptId,
  isLoading
}: ResultsListProps) {
  const hasMoreResults = results.length < total;

  const handleSelectConcept = (concept: Concept) => {
    onSelectConcept(concept);
    // Scroll back to top when a result is selected
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col mb-8">
      <div className="text-sm text-muted-foreground mb-3">
        Showing {results.length} of {total} results
      </div>

      <div className="border rounded-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found</p>
          </div>
        ) : (
          <ul className="divide-y">
            {results.map((concept, index) => (
              <li 
                key={`${concept.conceptId}-${index}`}
                className={`px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-sm ${
                  selectedConceptId === concept.conceptId ? 'bg-muted/40 border-l-2 border-primary' : ''
                }`}
                onClick={() => handleSelectConcept(concept)}
              >
                {concept.pt.term}
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasMoreResults && !isLoading && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
} 