"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ORGAN_SYSTEMS, PROCEDURE_METHODS } from "../lib/constants";
import { SearchParams } from "../lib/types";
import { Loader2, InfoIcon } from "lucide-react";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  onReset?: () => void;
  hasSearched?: boolean;
  initialParams?: SearchParams;
  isLoading?: boolean;
}

export default function SearchForm({ 
  onSearch, 
  onReset, 
  hasSearched = false, 
  initialParams,
  isLoading = false
}: SearchFormProps) {
  const [searchTerm, setSearchTerm] = useState(initialParams?.term || "");
  const [organSystem, setOrganSystem] = useState(initialParams?.organSystem || "all");
  const [procedureMethod, setProcedureMethod] = useState(initialParams?.procedureMethod || "all");
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [prevOrganSystem, setPrevOrganSystem] = useState(organSystem);
  const [prevProcedureMethod, setPrevProcedureMethod] = useState(procedureMethod);

  useEffect(() => {
    if (initialParams) {
      setSearchTerm(initialParams.term || "");
      setOrganSystem(initialParams.organSystem || "all");
      setProcedureMethod(initialParams.procedureMethod || "all");
      setPrevOrganSystem(initialParams.organSystem || "all");
      setPrevProcedureMethod(initialParams.procedureMethod || "all");
    }
  }, [initialParams]);

  // Helper function to trigger search - using useCallback to prevent recreation
  const triggerSearch = useCallback(() => {
    onSearch({
      term: searchTerm,
      organSystem: organSystem === "all" ? "" : organSystem,
      procedureMethod: procedureMethod === "all" ? "" : procedureMethod
    });
  }, [searchTerm, organSystem, procedureMethod, onSearch]);

  // Auto-refresh search results when inputs change (but only after the initial search)
  useEffect(() => {
    // Skip the first render to prevent automatic search when component mounts
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    
    // Only auto-refresh if we've already searched
    if (hasSearched) {
      // For searchTerm changes, only trigger if it has at least 3 characters or is empty
      if (searchTerm.length >= 3 || searchTerm.length === 0 || 
          organSystem !== prevOrganSystem || 
          procedureMethod !== prevProcedureMethod) {
        
        // Update previous values before searching
        setPrevOrganSystem(organSystem);
        setPrevProcedureMethod(procedureMethod);
        
        triggerSearch();
      }
    }
  }, [searchTerm, organSystem, procedureMethod, hasSearched, isInitialRender, triggerSearch, prevOrganSystem, prevProcedureMethod]);

  // Reset all search criteria
  const handleReset = () => {
    setSearchTerm("");
    setOrganSystem("all");
    setProcedureMethod("all");
    
    // Call the onReset callback if provided
    if (onReset) {
      onReset();
    } else {
      // If no onReset callback, just update the search params
      onSearch({
        term: "",
        organSystem: "",
        procedureMethod: ""
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="search-term" className="text-sm font-medium flex items-center gap-1">
              Search Term
              <div className="relative group">
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  Type at least 3 characters
                </div>
              </div>
            </label>
            <Input
              id="search-term"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="organ-system" className="text-sm font-medium">
              Organ System
            </label>
            <Select 
              value={organSystem} 
              onValueChange={(value) => setOrganSystem(value)}
            >
              <SelectTrigger id="organ-system" className="w-full">
                <SelectValue placeholder="Select organ system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organ Systems</SelectItem>
                {ORGAN_SYSTEMS.map((system) => (
                  <SelectItem key={system.value} value={system.value}>
                    {system.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="procedure-method" className="text-sm font-medium">
              Procedure Method
            </label>
            <Select 
              value={procedureMethod} 
              onValueChange={(value) => setProcedureMethod(value)}
            >
              <SelectTrigger id="procedure-method" className="w-full">
                <SelectValue placeholder="Select procedure method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Procedure Methods</SelectItem>
                {PROCEDURE_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2 space-y-2">
            {/* Show search button only when not in search results view */}
            {!hasSearched && (
              <Button 
                variant="default" 
                size="default" 
                onClick={triggerSearch}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            )}
            
            {hasSearched && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="w-full"
                disabled={isLoading}
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 