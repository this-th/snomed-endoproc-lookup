import { NextRequest, NextResponse } from 'next/server';
import { SNOWSTORM_API_BASE, BRANCH } from '@/app/config/api';

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request
    const searchParams = request.nextUrl.searchParams;
    
    // Create a new URLSearchParams object to build the backend URL
    const backendParams = new URLSearchParams();
    
    // Copy all parameters except ECL, which we'll handle specially
    searchParams.forEach((value, key) => {
      if (key !== 'ecl') {
        backendParams.append(key, value);
      }
    });
    
    // Add default parameters if not present
    if (!backendParams.has('activeFilter')) {
      backendParams.append('activeFilter', 'true');
    }
    if (!backendParams.has('includeLeafFlag')) {
      backendParams.append('includeLeafFlag', 'false');
    }
    if (!backendParams.has('form')) {
      backendParams.append('form', 'inferred');
    }
    
    // Get the ECL parameter
    let ecl = searchParams.get('ecl');
    
    // Build the base URL with the correct structure
    let targetUrl = `${SNOWSTORM_API_BASE}/${BRANCH}/concepts?`;
    
    // Add the regular parameters
    const paramsString = backendParams.toString();
    if (paramsString) {
      targetUrl += paramsString;
    }
    
    // Add the ECL parameter with proper encoding if it exists
    if (ecl) {
      // Add & if we already have parameters
      if (paramsString) {
        targetUrl += '&';
      }
      
      // First decode the ECL to handle any existing encoding
      try {
        ecl = decodeURIComponent(ecl);
      } catch (error) {
        // If decoding fails, continue with the original value
        console.warn('Failed to decode ECL parameter:', error);
      }
      
      // Replace any + with spaces, then re-encode properly
      ecl = ecl.replace(/\+/g, ' ');
      
      // Manually encode the ECL parameter to ensure proper encoding of spaces as %20
      targetUrl += `ecl=${encodeURIComponent(ecl)}`;
    }
    
    console.log('Proxying request to:', targetUrl);
    
    // Set up request options with carefully selected headers
    // Use a valid Accept-Language header
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'  // Set a valid Accept-Language value
      },
      method: 'GET'
    };
    
    // Make the request to the backend
    const response = await fetch(targetUrl, options);
    
    if (!response.ok) {
      console.error(`API proxy error: Status ${response.status}`);
      let errorText = "";
      try {
        errorText = await response.text();
        console.error("Error response:", errorText);
      } catch (error) {
        console.error("Could not read error response text");
      }
      
      return NextResponse.json(
        { error: `API error: ${response.status}`, message: errorText },
        { status: response.status }
      );
    }
    
    // Get the data from the response
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching concepts:", error);
    
    // Return an error response
    return NextResponse.json(
      { error: "Failed to fetch concepts" },
      { status: 500 }
    );
  }
}