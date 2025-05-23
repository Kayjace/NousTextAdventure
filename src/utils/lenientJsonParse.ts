const extractJsonFromResponse = (response: string): string => {
  const startIndex = response.indexOf('{');
  const endIndex = response.lastIndexOf('}') + 1;
  
  if (startIndex >= 0 && endIndex > 0) {
    return response.substring(startIndex, endIndex);
  }
  return response;
};

function cleanOptionTextInJson(jsonStr: string): string {
  // option.text 필드의 값에서 괄호 안, $4, 쌍따옴표 등 특수문자 제거
  return jsonStr.replace(/("text"\s*:\s*")([^"]+)(")/g, (match, p1, p2, p3) => {
    let cleaned = p2
      .replace(/\s*[\(（][^)）]*[\)）]/g, '') // 괄호 안 내용 제거
      .replace(/"traitAlignment"\$4\s*/g, '') // "traitAlignment"$4 제거
      .replace(/\"/g, '') // 이스케이프 쌍따옴표 제거
      .replace(/\$/g, '') // $ 기호 제거(필요시)
      .replace(/\s+/g, ' ') // 연속 공백 정리
      .trim();
    return p1 + cleaned + p3;
  });
}

const lenientJsonParse = (json: string, error: string): any => {
  // 먼저 JSON 부분만 추출
  let fixedJson = extractJsonFromResponse(json);

  // 한글 문자열에서 발생할 수 있는 문제 처리
  // 따옴표 누락 문제 해결
  fixedJson = fixedJson.replace(/(\s*{?\s*)(?<!")(\w+)(?!")(\s*:)/g, '$1"$2"$4');
  
  // 한글 속성 이름에 따옴표 추가
  fixedJson = fixedJson.replace(/(\s*{?\s*)(?<!")([\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]+)(?!")(\s*:)/g, '$1"$2"$4');
  
  // 줄바꿈 문자 제거
  fixedJson = fixedJson.replace(/\\n|\n/g, ' ');
  
  // 후행 쉼표 제거
  fixedJson = fixedJson.replace(/,\s*(}|])/g, '$1');
  
  // 따옴표 내부의 따옴표 이스케이프 처리
  fixedJson = fixedJson.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
    return match.replace(/(?<!\\)"/g, '\\"');
  });

  // option.text 정제 시도
  let cleanedJsonStr = cleanOptionTextInJson(fixedJson);

  try {
    // 파싱 시도
    const parsed = JSON.parse(cleanedJsonStr);
    
    // traitAlignment 필드 확인
    if (parsed && parsed.options) {
      console.log("Options after lenient parsing:", JSON.stringify(parsed.options, null, 2));
      const hasTraitAlignment = Object.values(parsed.options).some(
        (option: any) => option.traitAlignment
      );
      console.log("Has traitAlignment after lenient parsing:", hasTraitAlignment);
    }
    
    return parsed;
  } catch (evalError) {
    const castedError = evalError as Error;
    console.error('Error parsing JSON with lenientJsonParse:', castedError);
    console.error('Attempted to parse:', cleanedJsonStr);
    return { error: castedError.message };
  }
};

export default lenientJsonParse;
