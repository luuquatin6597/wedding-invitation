export interface Message {
  id: string;
  content: string; 
  type: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  structured_quotes?: string[];
}

export interface ApiGeneralResponse {
  type: 
    | 'unrecognized_input'
    | 'ai_error_with_suggestions'
    | 'fallback_suggestions'
    | 'api_controller_error'
    | 'greeting_response'
    | 'out_of_scope_response'
    | 'not_found_response'
    | 'ai_content_response'
    | 'ai_text_response';
  message: string; 
  suggestions?: string[];
  structured_quotes?: string[];
} 