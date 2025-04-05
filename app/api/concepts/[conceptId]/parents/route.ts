import { NextRequest, NextResponse } from 'next/server';
import { SNOWSTORM_API_BASE, BRANCH, VERSION, BROWSER_PATH } from '@/app/config/api';

export async function GET(
  request: NextRequest,
  props: any
) {
  try {
    const { conceptId } = props.params;
    
    // Get URL parameters
    const url = new URL(request.url);
    const form = url.searchParams.get('form') || 'inferred';
    
    // Build the target URL for the Snowstorm API
    const targetUrl = `${SNOWSTORM_API_BASE}${BROWSER_PATH}/${BRANCH}/${VERSION}/concepts/${conceptId}/parents?form=${form}`;
    
    console.log('Proxying concept parents request to:', targetUrl);
    
    // Set up request options with carefully selected headers
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      method: 'GET'
    };
    
    // Make the request to the backend
    const response = await fetch(targetUrl, options);
    
    if (!response.ok) {
      console.error(`API proxy error for concept parents: Status ${response.status}`);
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
    console.error("Error fetching parents:", error);
    
    // Return an error response
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    );
  }
} 