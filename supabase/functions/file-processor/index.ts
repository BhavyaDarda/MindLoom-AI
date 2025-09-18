import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP and user agent for logging
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const { fileId, transformationType, customPrompt } = await req.json();
    
    console.log('Processing file:', { fileId, transformationType });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get file details from database
    const { data: fileData, error: fileError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      throw new Error('File not found');
    }

    console.log('File data:', fileData);

    // Download file content from storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(fileData.storage_path);

    if (downloadError || !fileBlob) {
      throw new Error('Failed to download file');
    }

    // Process file based on type
    let extractedContent = '';
    
    if (fileData.file_type.includes('text') || fileData.file_type.includes('json')) {
      extractedContent = await fileBlob.text();
    } else if (fileData.file_type.includes('pdf')) {
      try {
        // Enhanced PDF processing with real content extraction
        const arrayBuffer = await fileBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // For now, use a simple text extraction approach
        // In production, you'd use a PDF parsing library like pdf-parse
        const text = new TextDecoder().decode(uint8Array);
        const pdfTextMatch = text.match(/stream\s*(.*?)\s*endstream/gs);
        
        if (pdfTextMatch && pdfTextMatch.length > 0) {
          extractedContent = pdfTextMatch
            .map(match => match.replace(/stream|endstream/g, '').trim())
            .join('\n')
            .substring(0, 5000); // Limit content
        } else {
          extractedContent = fileData.content_preview || `PDF file: ${fileData.file_name}\nSize: ${(fileData.file_size / 1024 / 1024).toFixed(2)} MB\n\nUnable to extract text content from this PDF. This may be an image-based PDF that requires OCR processing.`;
        }
      } catch (error) {
        console.error('PDF processing error:', error);
        extractedContent = fileData.content_preview || `PDF file: ${fileData.file_name}\nProcessing error occurred.`;
      }
    } else if (fileData.file_type.includes('word') || fileData.file_type.includes('document')) {
      try {
        // Enhanced DOCX processing
        const arrayBuffer = await fileBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Basic DOCX text extraction (simplified)
        const text = new TextDecoder().decode(uint8Array);
        const xmlMatch = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        
        if (xmlMatch && xmlMatch.length > 0) {
          extractedContent = xmlMatch
            .map(match => match.replace(/<[^>]*>/g, ''))
            .join(' ')
            .substring(0, 5000); // Limit content
        } else {
          extractedContent = fileData.content_preview || `Word document: ${fileData.file_name}\nSize: ${(fileData.file_size / 1024 / 1024).toFixed(2)} MB\n\nUnable to extract text content from this document.`;
        }
      } catch (error) {
        console.error('DOCX processing error:', error);
        extractedContent = fileData.content_preview || `Word document: ${fileData.file_name}\nProcessing error occurred.`;
      }
    } else if (fileData.file_type.includes('audio') || fileData.file_type.includes('video')) {
      // Enhanced media file processing with metadata
      extractedContent = `Media file: ${fileData.file_name}
Size: ${(fileData.file_size / 1024 / 1024).toFixed(2)} MB
Type: ${fileData.file_type}
Duration: Unknown (transcription service needed)

This is a ${fileData.file_type.includes('audio') ? 'audio' : 'video'} file. To get the actual content, we would need to:
1. Use a transcription service like OpenAI Whisper API
2. Extract audio track if video
3. Convert speech to text

For demonstration purposes, I'll provide a general analysis based on the file metadata.`;
    } else if (fileData.file_type.includes('image')) {
      // Enhanced image processing
      extractedContent = `Image file: ${fileData.file_name}
Size: ${(fileData.file_size / 1024 / 1024).toFixed(2)} MB
Type: ${fileData.file_type}
Dimensions: Unknown

This is an image file. To get actual content analysis, we would need to:
1. Use a vision AI service (GPT-4 Vision, Google Vision API, etc.)
2. Perform OCR if the image contains text
3. Analyze visual elements, objects, and scenes

For demonstration purposes, I'll provide a general description based on the file metadata.`;
    } else {
      extractedContent = `File: ${fileData.file_name}
Type: ${fileData.file_type}
Size: ${(fileData.file_size / 1024 / 1024).toFixed(2)} MB

Content extraction not supported for this file type. Supported types include:
- Text files (.txt, .md, .json)
- PDF documents
- Word documents (.docx)
- Audio files (.mp3, .wav, .m4a)
- Video files (.mp4, .avi, .mov)
- Images (.jpg, .png, .gif, .webp)`;
    }

    // Generate AI transformation using Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create transformation prompt based on type
    let systemPrompt = '';
    switch (transformationType) {
      case 'summary':
        systemPrompt = 'You are an expert at creating concise, accurate summaries. Analyze the content and provide a clear summary with key points.';
        break;
      case 'mindmap':
        systemPrompt = 'You are an expert at creating visual mind maps. Convert the content into a hierarchical mind map structure using emojis and indentation.';
        break;
      case 'podcast':
        systemPrompt = 'You are an expert podcast scriptwriter. Convert the content into an engaging podcast script with natural dialogue and storytelling.';
        break;
      case 'notes':
        systemPrompt = 'You are an expert at creating study materials. Convert the content into well-organized study notes with key concepts, definitions, and questions.';
        break;
      default:
        systemPrompt = customPrompt || 'Analyze and transform the following content in a helpful way.';
    }

    const prompt = `${systemPrompt}\n\nContent to transform:\n${extractedContent}`;

    console.log('Sending request to Gemini API...');

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const transformedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';

    console.log('Transformation complete');

    // Get the authenticated user (now required due to JWT verification)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Authentication required - no auth header');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      // Log security event
      try {
        await supabase.rpc('log_security_event', {
          p_action: 'failed_authentication',
          p_resource_type: 'file_processor',
          p_metadata: { ip_address: clientIP, user_agent: userAgent, error: authError?.message }
        });
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }
      
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log successful file processing request
    try {
      await supabase.rpc('log_security_event', {
        p_action: 'file_processing_requested',
        p_resource_type: 'file_processor',
        p_metadata: { ip_address: clientIP, user_agent: userAgent, file_id: fileId }
      });
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }

    const { data: transformation, error: saveError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id, // Use authenticated user ID
        file_upload_id: fileId,
        title: `${transformationType} of ${fileData.file_name}`,
        transformation_type: transformationType,
        original_content: extractedContent.substring(0, 1000), // Limit original content size
        transformed_content: transformedContent
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save transformation:', saveError);
    }

    return new Response(JSON.stringify({
      success: true,
      transformedContent,
      transformationType,
      title: `${transformationType} of ${fileData.file_name}`,
      transformationId: transformation?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in file-processor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});