import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DatabaseTransformation {
  id: string;
  title: string;
  transformation_type: string;
  transformed_content: string;
  created_at: string;
  file_upload_id?: string;
  user_id?: string;
}

interface TransformationResult {
  id: string;
  url?: string;
  title: string;
  transformationType: string;
  result: {
    transformedContent: string;
    relatedQuestions?: string[];
  };
  timestamp: number;
  content?: string;
}

export function useTransformationHistory() {
  const [transformationHistory, setTransformationHistory] = useState<TransformationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load transformations from database
  const loadTransformations = useCallback(async () => {
    if (!user) {
      setTransformationHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transformations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: TransformationResult[] = data.map((item: DatabaseTransformation) => ({
        id: item.id,
        title: item.title,
        transformationType: item.transformation_type,
        result: {
          transformedContent: item.transformed_content,
          relatedQuestions: []
        },
        timestamp: new Date(item.created_at).getTime(),
        content: item.transformed_content
      }));

      setTransformationHistory(formattedData);
    } catch (error) {
      console.error('Failed to load transformations:', error);
      toast({
        title: "Error",
        description: "Failed to load transformation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadTransformations();
  }, [loadTransformations]);

  // Save transformation result
  const saveTransformation = useCallback(async (
    url: string | undefined,
    title: string,
    transformationType: string,
    result: any,
    content?: string
  ) => {
    if (!user) {
      // Fall back to localStorage for non-authenticated users
      const newTransformation: TransformationResult = {
        id: Date.now().toString(),
        url,
        title,
        transformationType,
        result,
        timestamp: Date.now(),
        content,
      };

      setTransformationHistory(prev => [newTransformation, ...prev.slice(0, 49)]);
      return newTransformation.id;
    }

    try {
      const { data, error } = await supabase
        .from('transformations')
        .insert({
          user_id: user.id,
          title,
          transformation_type: transformationType,
          original_content: content?.substring(0, 1000) || '',
          transformed_content: result.transformedContent || result
        })
        .select()
        .single();

      if (error) throw error;

      const newTransformation: TransformationResult = {
        id: data.id,
        url,
        title,
        transformationType,
        result,
        timestamp: new Date(data.created_at).getTime(),
        content
      };

      setTransformationHistory(prev => [newTransformation, ...prev]);
      return data.id;
    } catch (error) {
      console.error('Failed to save transformation:', error);
      toast({
        title: "Error",
        description: "Failed to save transformation",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Get transformation by ID
  const getTransformation = useCallback((id: string) => {
    return transformationHistory.find(t => t.id === id);
  }, [transformationHistory]);

  // Delete transformation
  const deleteTransformation = useCallback(async (id: string) => {
    if (!user) {
      setTransformationHistory(prev => prev.filter(t => t.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('transformations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransformationHistory(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Deleted",
        description: "Transformation deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete transformation:', error);
      toast({
        title: "Error",
        description: "Failed to delete transformation",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Clear all transformations
  const clearHistory = useCallback(async () => {
    if (!user) {
      setTransformationHistory([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('transformations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setTransformationHistory([]);
      toast({
        title: "Cleared",
        description: "All transformations cleared successfully",
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast({
        title: "Error",
        description: "Failed to clear transformation history",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Export transformations
  const exportTransformations = useCallback(() => {
    const dataStr = JSON.stringify(transformationHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindloom-transformations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [transformationHistory]);

  return {
    transformationHistory,
    saveTransformation,
    getTransformation,
    deleteTransformation,
    clearHistory,
    exportTransformations,
    isLoading,
    refreshHistory: loadTransformations,
  };
}