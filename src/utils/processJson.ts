import lenientJsonParse from './lenientJsonParse';

// JSON 부분만 추출하는 함수
const extractJsonFromResponse = (response: string): string => {
  const startIndex = response.indexOf('{');
  const endIndex = response.lastIndexOf('}') + 1;
  
  if (startIndex >= 0 && endIndex > 0) {
    return response.substring(startIndex, endIndex);
  }
  return response;
};

const processJson = <T>(response: string): T => {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid response: response is empty or not a string');
  }

  let responseObject;
  let jsonPart = '';

  try {
    // 먼저 JSON 부분만 추출 후 파싱 시도
    jsonPart = extractJsonFromResponse(response);
    
    console.log("Extracted JSON before processing:", jsonPart);
    
    // 추가 정리: 따옴표 문제 해결
    jsonPart = jsonPart.replace(/(\s*{?\s*)(?<!")(\w+)(?!")(\s*:)/g, '$1"$2"$4');
    // 줄바꿈 제거
    jsonPart = jsonPart.replace(/\\n|\n/g, ' ');
    // 후행 쉼표 제거
    jsonPart = jsonPart.replace(/,\s*(}|])/g, '$1');
    
    console.log("Processed JSON before parsing:", jsonPart);
    
    responseObject = JSON.parse(jsonPart);
    
    // Check for traitAlignment fields
    if (responseObject && responseObject.options) {
      console.log("Options after parsing:", JSON.stringify(responseObject.options, null, 2));
      // Check if any option has traitAlignment
      const hasTraitAlignment = Object.values(responseObject.options).some(
        (option: any) => option.traitAlignment
      );
      console.log("Has traitAlignment:", hasTraitAlignment);
    }
  } catch (error) {
    const castedError = error as Error;
    console.error('Error parsing JSON response:', castedError);
    console.error('Attempted to parse:', jsonPart);

    // Use lenientJsonParse if standard JSON parsing fails
    try {
      responseObject = lenientJsonParse(response, castedError.message);
    } catch (lenientError) {
      console.error('Both parsing methods failed:', lenientError);
      throw new Error('Failed to parse JSON response after multiple attempts');
    }
  }

  // If lenientJsonParse also fails, throw an error
  if (responseObject && 'error' in responseObject) {
    throw new Error('Both standard JSON parsing and lenientJsonParse failed');
  }

  // Extract and process the data based on the provided type T
  const processedData: T = responseObject;

  // Return the processed data as a TypeScript object of type T
  return processedData;
};

export default processJson;
