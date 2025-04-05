"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SearchForm from "./components/SearchForm";
import ResultsList from "./components/ResultsList";
import ConceptDetail from "./components/ConceptDetail";
import { searchConcepts, getConceptDetails } from "./lib/api";
import { Concept, ConceptDetail as ConceptDetailType, SearchParams } from "./lib/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { VERSION } from "@/app/config/api";

export default function Home() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    term: "",
    organSystem: "",
    procedureMethod: ""
  });
  
  const [results, setResults] = useState<Concept[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [conceptDetail, setConceptDetail] = useState<ConceptDetailType | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  // Add state for error handling
  const [searchError, setSearchError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Add a ref for the concept detail section
  const conceptDetailRef = useRef<HTMLDivElement>(null);

  // Add state for mobile view management
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);

  // Search for concepts - called manually by the SearchForm component
  const handleSearch = useCallback((params: SearchParams) => {
    // Update search parameters
    setSearchParams(params);
    
    // Execute the search regardless of whether criteria are provided
    // This allows the static part of the ECL to be used for searching
    const fetchResults = async () => {
      setIsSearching(true);
      setSearchError(null); // Clear previous errors
      try {
        const response = await searchConcepts(params);
        setResults(response.items);
        setTotalResults(response.total);
        setCurrentPage(0);
        setHasSearched(true);
        
        // Clear the selected concept and details when search parameters change
        setSelectedConcept(null);
        setConceptDetail(null);
      } catch (error) {
        console.error("Error searching concepts:", error);
        setSearchError(error instanceof Error ? error.message : "Failed to fetch results");
        setResults([]);
        setTotalResults(0);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, []);

  // Fetch concept details when a concept is selected
  useEffect(() => {
    if (!selectedConcept) {
      setConceptDetail(null);
      return;
    }

    const fetchConceptDetail = async () => {
      setIsLoadingDetail(true);
      setDetailError(null); // Clear previous errors
      try {
        const detail = await getConceptDetails(selectedConcept.conceptId);
        setConceptDetail(detail);
      } catch (error) {
        console.error("Error fetching concept details:", error);
        setDetailError(error instanceof Error ? error.message : "Failed to fetch concept details");
        setConceptDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchConceptDetail();
  }, [selectedConcept]);

  // Handle reset - clear all results and return to initial state
  const handleReset = useCallback(() => {
    // Clear search parameters
    setSearchParams({
      term: "",
      organSystem: "",
      procedureMethod: ""
    });
    
    // Clear results and selection state
    setResults([]);
    setTotalResults(0);
    setCurrentPage(0);
    setSelectedConcept(null);
    setConceptDetail(null);
    
    // Reset the layout
    setHasSearched(false);
  }, []);

  // Handle loading more results
  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    const offset = nextPage * 20;

    try {
      // Set loading state
      setIsSearching(true);
      
      // Use the current searchParams state
      const response = await searchConcepts(searchParams, offset);
      setResults([...results, ...response.items]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more results:", error);
      setSearchError(error instanceof Error ? error.message : "Failed to load more results");
    } finally {
      // Clear loading state
      setIsSearching(false);
    }
  };

  // Handle selecting a concept
  const handleSelectConcept = (concept: Concept) => {
    setSelectedConcept(concept);
    
    // On mobile devices, show the detail view
    if (window.innerWidth < 1024) {
      setShowDetailOnMobile(true);
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Handle back button on mobile
  const handleBackToResults = () => {
    setShowDetailOnMobile(false);
  };

  return (
    <main className="min-h-screen">
      <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 hidden lg:flex items-center gap-2">
        <div className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
          v{VERSION}
        </div>
        <ThemeToggle />
      </div>
      {!hasSearched ? (
        <div className="container mx-auto py-6 px-4 md:px-6 flex-grow flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <header className="mb-6 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                SNOMED CT Endoscopic Procedures Lookup
              </h1>
              <p className="text-muted-foreground mt-1 mb-2">
                Search for endoscopic procedures in SNOMED CT terminology
              </p>
              <div className="lg:hidden flex justify-center items-center gap-2 mb-4">
                <div className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  v{VERSION}
                </div>
                <ThemeToggle />
              </div>
            </header>
            <SearchForm onSearch={handleSearch} initialParams={searchParams} />
            
            {/* Display search error on initial screen */}
            {searchError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
                <p className="text-sm font-medium">Error: {searchError}</p>
                <p className="text-xs mt-1">
                  Please check if the API server is running at localhost:8080
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col min-h-screen">
          <header className="py-4 bg-background mb-8">
            <div className="container mx-auto px-4 md:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  SNOMED CT Endoscopic Procedures Lookup
                </h1>
                <p className="text-muted-foreground mt-1">
                  Search for endoscopic procedures in SNOMED CT terminology
                </p>
                <div className="lg:hidden flex items-center gap-2 mt-2">
                  <div className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    v{VERSION}
                  </div>
                  <ThemeToggle />
                </div>
              </div>
              {/* Mobile view context indicator */}
              {showDetailOnMobile && selectedConcept && (
                <div className="flex items-center mt-3 lg:hidden">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBackToResults}
                    className="flex items-center gap-1 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" /> 
                    Back to results
                  </Button>
                </div>
              )}
            </div>
          </header>
          
          <div className="container mx-auto pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left column - Search form - Always visible */}
              <div className={`lg:col-span-3 ${showDetailOnMobile ? 'hidden lg:block' : 'block px-4 lg:px-0'}`}>
                <SearchForm 
                  onSearch={handleSearch} 
                  onReset={handleReset} 
                  hasSearched={hasSearched} 
                  initialParams={searchParams}
                  isLoading={isSearching}
                />
              </div>
              
              {/* Middle column - Results list - Hidden on mobile when showing details */}
              <div className={`lg:col-span-4 ${showDetailOnMobile ? 'hidden lg:block' : 'block px-4 lg:px-0'}`}>
                {searchError ? (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-800">
                    <p className="text-sm font-medium">Error: {searchError}</p>
                    <p className="text-xs mt-1">
                      Please check if the API server is running at localhost:8080
                    </p>
                  </div>
                ) : (
                  <ResultsList
                    results={results}
                    total={totalResults}
                    onLoadMore={handleLoadMore}
                    onSelectConcept={handleSelectConcept}
                    selectedConceptId={selectedConcept?.conceptId}
                    isLoading={isSearching}
                  />
                )}
              </div>
              
              {/* Right column - Concept detail - Conditionally shown on mobile */}
              <div className={`lg:col-span-5 h-auto ${showDetailOnMobile ? 'block px-4 lg:px-0' : 'hidden lg:block'}`} ref={conceptDetailRef}>
                {detailError ? (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-800">
                    <p className="text-sm font-medium">Error: {detailError}</p>
                    <p className="text-xs mt-1">
                      Please check if the API server is running at localhost:8080
                    </p>
                  </div>
                ) : (
                  <ConceptDetail
                    conceptDetail={conceptDetail}
                    isLoading={isLoadingDetail}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="py-4 mt-auto">
        <div className="container mx-auto px-4 md:px-6 text-center text-xs text-muted-foreground">
          Developed by <a href="https://www.this.or.th/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Thai Health Information Standards Development Center (THIS)</a> in 2025
        </div>
      </footer>
    </main>
  );
}
